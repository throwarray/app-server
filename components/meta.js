import { parallelLimit } from 'async'

import { fetch, formatURL, combineURLS } from './fetch'

import { useState, useEffect } from 'react'

import useSWR from 'swr'

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
        console.log('fetch provider meta', { pathname: combineURLS(provider.url, pathname), query })

        return Promise.resolve(fetch(formatURL({ pathname: combineURLS(provider.url, pathname), query }), { signal })
            .then(response => response.json())
            .then(function (meta) {
                meta.provider = provider.id
    
                return meta
            })
            .then(function (value) { return { status: 'fulfilled', value } }, function (error) {
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

function useProviderMetas (prv, query, pathname = '/meta.json', key = JSON.stringify(query)) {
    const [{ controller, results: partialResults }, setState] = useState({})

    const { error, data: completeResults } = useSWR(key, async function () {
        if (controller) controller.abort()

        const providers = prv
        const results = await new Promise(function (resolve, reject) {
            let results = {}

            if (!Array.isArray(providers) || !providers.length) {
                setState({})
                resolve()
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

    const loading = !error && completeResults === void 0

    return {
        loading,
        results: error? void 0 : loading? partialResults : completeResults
    }
}

function useProviderStreams (streamProviders, query, key) {    
    const { results, loading } = useProviderMetas(streamProviders, query, '/streams.json', key)

    return {
        streamProviders,
        streams: results,
        loadingStreams: loading && streamProviders.length
    }
}

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
    useProviderStreams,
    useProviderMetas,
    fetchProviderMetas
}