import { parallelLimit } from 'async'

import { fetch, formatURL, combineURLS } from './fetch'

import { parseIdPrefix, metaQueryItem, filterProviders } from './utils'

import { useState, useEffect, useMemo } from 'react'

import useSWR from 'swr'

import { scan } from '@commercial/bourne'

// Fetch provider data
function fetchProviderMetas (query, providers, handleOne = (d)=> d, pathname = '/meta.json', cb) {
    let deferred, count = 0

    if (!providers || !providers.length) return cb(false, [])

    const controller = new AbortController()

    const signal = controller.signal

    const onAbort = function () { 
        deferred(new Error('AbortError'))

        signal.removeEventListener('abort', onAbort)
    }

    signal.addEventListener('abort', onAbort)

    function fetchMetaProvider (provider, signal) {
        return Promise.resolve(fetch(formatURL({ pathname: combineURLS(provider.url, pathname), query: metaQueryItem(query) }), { signal })
            .then(response => {
                if (response.status >= 400 || response.status < 200) 
                    throw new Error('Invalid response')
                else
                    return response.json()
            })
            .then(function (meta) {
                meta.provider = provider.id

                scan(meta, { protoAction: 'remove' })

                return meta
            })
            .then(function (value) { 
                return { status: 'fulfilled', value } 
            }, function (error) {
                return { status: 'rejected', value: error }
            }))
    }

    parallelLimit([
        function (cb) { deferred = cb },

        ...providers.map(function (provider, i) {
            return function (cb) {
                count = count + 1

                fetchMetaProvider(provider, signal).then(function (reflected) {
                    if (!signal.aborted) {
                        if (count === providers.length) { 
                            deferred()
        
                            signal.removeEventListener('abort', onAbort)
                        }
                        cb(null, handleOne(reflected, i))
                    }
                })
            }
        })
    ], 4, function (err, results) {
        if(err) cb(err)
        else {
            const [,...reflected] = results

            cb(false, reflected)
        }
    })

    return controller
}

// Fetch collection
async function fetchCollection (query, providersArr = []) {
    const id = query.id
    const prefix = (query.id || '').split('-')[0]
    const providers = [...providersArr, {}]
    const prv = filterProviders(prefix, providers, 'collections')

    const collection = await new Promise(function (resolve, reject) {
        let completed

        const controller = fetchProviderMetas(
            query, 
            prv, 
            d => {
                if (d.status === 'fulfilled') {
                    completed = d
                    controller.abort()
                }
            },
            '/collection.json', 
            function () {
                controller.abort()

                if (!completed) {
                    reject(new Error('Unhandled request'))
                } else {
                    resolve(completed.value)
                }
            }
        )
    })

    if (collection) Object.assign(collection, {
        id,
        title: query.title,
        paginated: query.paginated || query.type !== 'collection'
    })

    return collection
}

// Use fetch json
function useProviderJSON (prv, query, pathname = '/meta.json', key = JSON.stringify(query)) {
    const [{ controller, results: partialResults }, setState] = useState({})

    const { error, data: completeResults } = useSWR(key, async function () {
        if (controller) controller.abort()

        console.log(`[${pathname}]:${key}`, query, prv)

        const providers = prv

        if (!providers.length) throw new Error('Invalid query')

        const results = await new Promise(function (resolve, reject) {
            let results = {}

            if (!Array.isArray(providers) || !providers.length) {
                setState({})
                reject()
                return
            }

            setState({
                controller: fetchProviderMetas(query, providers, function (reflected, i) {
                    const id = providers[i].id
                    
                    results = { ...results, [id]: reflected }

                    setState((state)=> {
                        return { ...state, results }
                    })
        
                    return reflected
                }, pathname, function (err) {
                    if (err) reject(err)
                    else resolve(results)
                })
            })
        })

        if (!results) throw new Error('Invalid response')

        return results
    }, {
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        shouldRetryOnError: false 
    })

    useEffect(function () {
        return function () {
            if (controller) controller.abort()
        }
    }, [controller])

    const loading = prv && prv.length && !error && completeResults === void 0

    return {
        loading,
        results: error? void 0 : loading? partialResults : completeResults,
        error,
        key
    }
}

// Use filtered providers for item id
function useFilteredProviders (providers, query, pathtype) {
    const mem = useMemo(function () {
        const id = query && query.id
        const prefix = parseIdPrefix(id)
        const prv = filterProviders(prefix, providers, pathtype)
        const handlesPrefix = Array.isArray(prv) && prv.length

        return {
            providers: prv,
            prefix,
            handlesPrefix
        }
    }, [providers, query, pathtype])

    return mem
}

// Use metas for item id
function useProviderMetas (providers, query, userUpdatedAt, key = 'all') {
    const keyname = `#meta|${key}|${query.type}|${query.id}|${query.season || 1}|${userUpdatedAt}`

    return useProviderJSON(providers, query, '/meta.json', keyname)
}

// Use streams for item id
function useProviderStreams (providers, query, userUpdatedAt, key = 'all') {
    const { providers: streamProviders } = useFilteredProviders(providers, query, 'streams')
    const invalid = !query.id || !Array.isArray(streamProviders) || !streamProviders.length
    const keyname = invalid? null : `#streams|${key}|${query.type}|${query.id}|${query.season}|${userUpdatedAt}` 
    const { results, loading, error } = useProviderJSON(streamProviders, query, '/streams.json', keyname)

    return {
        streamProviders,
        streams: results,
        loadingStreams: loading && streamProviders.length,
        streamsError: error,
        key: keyname
    }
}

// Use provider collection (-> first success)
function useProviderCollection (providers, query, userUpdatedAt) {
    const key = `#collection|${query.type}|${query.id}|${query.page}|${userUpdatedAt}`
    const output = useSWR(key, async function () {
        if (Array.isArray(providers)) {
            const collection = await fetchCollection(query, providers)

            return collection
        }
    }, {
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        shouldRetryOnError: false 
    })

    return { ...output, key }
}

// Allow mimetype short form
function matchedMime (key) {
    if (typeof key === 'string') {
        const parts = key.split('/')

        if (parts.length <= 1) {
            const extension = parts[0]

            const mimes = {
                'mp4': 'video/mp4',
                'm4v': 'video/mp4',
                'm4a': 'audio/mp4',
                'webm': 'video/webm',
                'ts': 'video/mp2t',
                'm3u8': 'application/x-mpegurl',
                'hls': 'application/x-mpegurl',
                'mp3': 'audio/mpeg',
                'aac': 'audio/aac',
                'flac': 'audio/flac',
                'mpd': 'application/dash+xml',
                'dash': 'application/dash+xml',
                'mkv': 'video/webm' // chrome
            }
    
            return mimes[extension]
        
        } else return key
    }
}

// DRM properties interop
function keySystems (drm) {
    if (!drm) return

    const output = {}

    if(drm['com.widevine.alpha']) output['com.widevine.alpha'] = drm['com.widevine.alpha']
    if(drm['com.microsoft.playready']) output['com.microsoft.playready'] = drm['com.microsoft.playready']
    if(drm['com.apple.fps.1_0']) output['com.apple.fps.1_0'] = drm['com.apple.fps.1_0']
    if (drm.widevine) output['com.widevine.alpha'] = drm.widevine
    if (drm.playready) output['com.microsoft.playready'] = drm.playready
    if (drm.fairplay) {
        const fair = drm.fairplay
        const certificateUri =  fair.certificateUrl || fair.certificateUri
        const licenseUri = fair.processSpcUrl || fair.licenseUri
        const o = {}

        for (let [k, v] of Object.entries(fair)) {
            switch(k) {
                case 'certificateUri':
                case 'certificateUrl':
                case 'processSpcUrl':
                case 'licenseUri': break
                default: o[k] = v 
                break
            }
        }

        o.certificateUri = certificateUri

        o.licenseUri = licenseUri

        output['com.apple.fps.1_0'] = o
    }

    return output
}

export {
    keySystems,
    matchedMime,
    useFilteredProviders,
    useProviderMetas,
    useProviderStreams,
    useProviderCollection,
    fetchProviderMetas,
    fetchCollection
}