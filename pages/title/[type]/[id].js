import { useReducer, useCallback, useEffect, useState, useMemo } from 'react'

import Head from 'next/head'

import router from 'next/router'

import LazyLoad from 'react-lazy-load'

import dynamic from 'next/dynamic'

import { Spinner } from '../../../components/Layout'

import { serverRoute } from '../../../components/fetch'

import { filterProviders, metaQueryItem } from '../../../components/utils'

import { keySystems, matchedMime, useProviderMetas, useProviderStreams } from '../../../components/meta'

// import 'video.js/dist/video-js.min.css' // breaks routing in dev?

const Video = dynamic(() => import('../../../components/VideoJs'), { ssr: false })

function parseIdPrefix (id) { return (id || '').split('-')[0] } // TODO move to common utils

function useHandlesId (userProviders, metaId, pathname = 'streams') {
    const arr = useMemo(function () {
        if (metaId) {
            const prefix = parseIdPrefix(metaId)
            const streamProviders = filterProviders(prefix, userProviders, pathname)

            return [streamProviders && !!streamProviders.length, prefix, streamProviders]
        } else return []
    }, [userProviders, metaId, pathname])

    return arr // [handlesPrefix, prefix, providers]
}


function playVideoJs (player, fileIn) {
    if (!player) return
    
    const { src, file: filepath, url, contentType, ...file } = fileIn
    const mime = contentType || file.type // allow contentType property for playing from meta responses which have a type property already

    file.src = src || filepath || url

    if (mime === 'video/youtube' || mime === 'youtube') player.controls(false)
    else player.controls(true)
    
    let type = matchedMime(mime)

    if (file.drm) {
        file.keySystems = keySystems(file.drm)

        delete file.drm
    }

    file.type = type
    file.overrideNative = true

    console.log('[play]', file)

    player.src(file)

    player.qualityLevels()

    // if (file.thumbnails) player.vttThumbnails({
    //     src: file.thumbnails
    // })

    return file
}

function metaReducer (prevState = {}, action) {
    const nextState = { ...prevState }
    const updateKey = key => nextState[key] = action.payload
    const actionToKeyMap = new Map([
        ['setSeason', 'season'],
        ['setPlayer', 'player'],
        ['setResults', 'metas'],
        ['setSelected', 'selected'],
        ['setSource', function (nextState, action) {
            updateKey('playerSrc')

            nextState.invokeStreamHandlers = !action.meta

            return nextState
        }]
    ])

    const actionType = action && action.type

    if (actionToKeyMap.has(actionType)) {
        const keyname = actionToKeyMap.get(actionType)

        console.log('Dispatch action', actionType, action.payload)

        if (typeof keyname === 'function') return keyname(nextState, action) 
        
        updateKey(keyname)

        return nextState
    } else {
        console.warn('Unsupported action', actionType)
    }

    return prevState
}

const msgStyles = {
    background: 'orange',
    alignSelf: 'baseline',
    padding: '1em',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    fontSize: '0.75em',
    borderRadius: '3px',
    boxShadow: '1px 1px 3px darkorange',
    color: '#333',
    margin: '0.25em',
}

export default function InitialMeta({ providers: userProviders, router, userUpdatedAt }) {    
    // Filter query parameters
    const routerQuery = router.query
    const query = useMemo(function () { return metaQueryItem(routerQuery) }, [routerQuery])
    const queryId = query.id
    const shouldUseTmdb = routerQuery.tmdb_id !== 'false' && routerQuery.tmdb_id !== false
    
    // Filter providers that handle the query id
    const [metaProviders, defaultMetaProvider] = useMemo(function () {
        const prefix = parseIdPrefix(queryId)
        const metaProviders = filterProviders(prefix, userProviders, 'meta').filter(({ id }) => id && id !== 'tmdb')
        const pref = metaProviders.find(provider => provider && provider.id === prefix)
        const tmdb = shouldUseTmdb && { id: 'tmdb' }
        const selected = tmdb || pref || metaProviders[0]
        const selectedId = selected && selected.id
    
        console.log('getMetaProviders', metaProviders)
        console.log('should use tmdb meta', shouldUseTmdb)

        return [metaProviders, selectedId]
    }, [userProviders, queryId, shouldUseTmdb])

    // Opt out of automatic TMDb meta
    // Initialize state and actions
    const [{ player, selected, playerSrc, invokeStreamHandlers, season, metas }, dispatch] = useReducer(metaReducer, { 
        selected: defaultMetaProvider,
        season: query.season
    })
    
    const actions = useMemo(function () {
        return {
            setSeason (season) { dispatch({ type: 'setSeason', payload: season }) }, 
            setPlayer (player) { dispatch({ type: 'setPlayer', payload: player }) },
            setSelected (selected) { dispatch({ type: 'setSelected', payload: selected }) },
            setResults (results) { dispatch({ type: 'setResults', payload: { ...results } }) }
        }
    }, [dispatch])

    actions.setSource = function (meta) {
        if (!player) return

        const { src, file, url } = meta
        const srcpath = src || url || file

        console.log('SET SOURCE', meta, srcpath)

        if (srcpath) {

            playVideoJs(player, meta)
        }

        dispatch({ 
            type: 'setSource', 
            payload: meta, 
            meta: srcpath 
        }) 
    }

    const [streamProviders, streamQuery] = useMemo(function () {
        if (!playerSrc || !invokeStreamHandlers) return [[], {}]

        const query = metaQueryItem(playerSrc)
        const streamId = query.id

        if (!Array.isArray(userProviders) || !userProviders.length || streamId === void 0) return []

        const prefix = parseIdPrefix(streamId)
        const streamProviders = filterProviders(prefix, userProviders, 'streams')

        console.log('invokeStreamProviders', streamProviders, query)

        return [streamProviders, query]
    }, [playerSrc, invokeStreamHandlers, userProviders])

    const { streams, loadingStreams } = useProviderStreams(streamProviders, streamQuery, `#streams|all|${streamQuery.type}|${streamQuery.id}|${streamQuery.season}|${userUpdatedAt}`)

    // Fetch TMDb meta
    const tasks = useMemo(function () {
        if (shouldUseTmdb) return [ // just pass an empty task queue otherwise
            {
                title: 'TMDb',
                id: 'tmdb',
                url: serverRoute('/providers/tmdb'),
                collections: ['tmdb'],
                meta: ['*'],
                streams: ['tmdb']
            }
        ]
        else return []
    }, [shouldUseTmdb])
        
    const { loading: tmdb_loading, results: resultsFromTmdb } = useProviderMetas(tasks, query, '/meta.json', `#meta|tmdb|${query.type}|${query.id}|${query.season}|${userUpdatedAt}`)
    const tmdbReflected = (resultsFromTmdb || {})['tmdb']
    const tmdb_meta = tmdbReflected && tmdbReflected.status === 'fulfilled' && tmdbReflected.value
    const tmdb_error = tmdbReflected && tmdbReflected.status === 'rejected'

    // Handle player ready
    const { setPlayer } = actions
    const onPlayerReady = useCallback(function (err, player) { 
        if (player) { 
            player.fluid(true)
            setPlayer(player) 
        }
    }, [setPlayer])
    
    const childProps = { season, actions, player, query, router, userProviders, metas }
    
    console.log('render player wrapper')

    // Render the page
    return <div>
        <Head>
            <title key="page-title">{router.query.id } | Title | App</title>
            <meta key="page-description" name="Description" content={`${ router.query.id } | Title | App`}/>
            <link key="player-styles" href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet"></link>
            <link key="preconnect-ytimg" rel="preconnect" href="https://s.ytimg.com"></link>
            <link key="preconnect-youtube" rel="preconnect" href="https://www.youtube.com"></link>
        </Head>

        {/* Mount the player here because meta unmounts during season select */}
        <div style={{ display: playerSrc? 'initial': 'none', maxHeight: '80vh', height: '80vh' }} aria-hidden={(playerSrc? 'false' : 'true')}>
            <Video onPlayerReady={onPlayerReady}></Video>
            <Streams
                {...childProps} 
                streams={streams} 
                streamProviders={streamProviders}
                loadingStreams={loadingStreams}
            >
            </Streams>
        </div>
        {
            /* Wait for tmdb meta to return so we have tmdb info to pass to providers */
            !tmdb_loading? <Meta
                {...childProps}
                userUpdatedAt={userUpdatedAt}
                selected={selected}
                tmdb_meta={tmdb_meta} 
                tmdb_error={tmdb_error}
                providers={metaProviders} // meta providers
            /> : null
        }
    </div>
}

function Streams ({ streams, streamProviders, player, /* loadingStreams,  actions */ }) {
    return <div className="streams-wrapper">
        <style jsx>{`
            .streams-wrapper {
                // background: white;
                // color: #333;
            }
        `}
        </style>
        { streamProviders && streamProviders.map((provider)=> {
            const hasStreams = streams && Object.prototype.hasOwnProperty.call(streams, provider.id)
            const reflected = hasStreams && streams[provider.id]
            const providerStreams = reflected && reflected.status == 'fulfilled' && reflected.value
            // const rejected = reflected && reflected.status === 'rejected'

            console.log('streams', providerStreams)

            return <div key={provider.id}>
                <h3>{provider.id}</h3>
                <ul>
                {
                    providerStreams && providerStreams.map(function (stream, i) {
                        const src = stream.src || stream.url || stream.file

                        if (!src) return null

                        return <li role="button" aria-label="Play video" style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                        }} key={i} onClick={()=> { playVideoJs(player, stream) }}>{ src }</li>
                    }) || null
                }
                </ul>  
            </div>
        }) || null }
    </div>
}

function Meta ({ player, tmdb_meta, query, providers, actions, selected, userProviders, season, tmdb_error, userUpdatedAt }) {
    console.log('[render] Meta', selected, season)

    const { setSeason, setSelected, setResults } = actions

    const handleChange = useCallback(function (evt) { // handle meta provider change
        console.log('select meta provider', evt.target.value)
        
        setSelected(evt.target.value)
    }, [setSelected])

    const handleSeasonSelect = useCallback(function (evt) { // handle season select
        const seasonNumber = Number(evt.target.value)
        const dest = { pathname: router.pathname, query: metaQueryItem({ ...query, season: seasonNumber })  }
        const { type, id, ...asQuery } = dest.query

        router.replace(dest, { pathname: `/title/${query.type}/${query.id}`, query: asQuery }, { shallow: true })

        setSeason(seasonNumber)
    }, [setSeason, query])

    // fetch metas
    const { results: metasByProvider } = useProviderMetas(providers, query, '/meta.json', `#meta|all|${query.type}|${query.id}|${query.season}|${userUpdatedAt}`)
    const meta_fallback = useMemo(function () { return metaQueryItem(tmdb_meta || query) }, [tmdb_meta, query]) // fallback to partial info from tmdb or query 
    const results = useMemo(function () {
        if (!tmdb_meta) return metasByProvider || {}
        
        const appended = { status: tmdb_error? 'rejected' : 'fulfilled', value: tmdb_meta }
        
        if (metasByProvider) {
            metasByProvider['tmdb'] = metasByProvider['tmdb'] || appended
            
            return metasByProvider
        } else {
            return { tmdb: appended }
        }
    }, [tmdb_meta, metasByProvider, tmdb_error])
    
    // FIXME share meta results with parent component
    useEffect(function () { setResults(results)  }, [setResults, results])


    // Pick the selected meta from meta responses
    let reflected

    // if (!hasOwn.call(results, selected)) { // fallback to partial info from tmdb or query while loading
    //     reflected  = { status: 'pending', value: meta_fallback }
    // } else 
    
    reflected = results[selected] // use selected meta

    let { status, value: meta } = reflected || {}

    if (status === 'rejected' && metasByProvider) {
        const nextAvailable = Object.keys(results).find(key => {
            key !== selected && results[key].status !== 'rejected'
        })
        
        if (nextAvailable) {
            console.log('Fallback to next available provider', nextAvailable)
            setSelected(nextAvailable)
        }
    } 
    
    if (!meta) {
        meta = meta_fallback

        if (status !== 'pending') {
            // TODO Show error message
        }
    }


    const trailer = meta.trailer
    const playDirect = meta.src || meta.url || meta.file

    return <div>
        <div style={{display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                width: '200px',
                height: '300px',
                maxWidth: '100%',
                margin: '0.5em'
            }}>
                <img alt="" referrerPolicy="same-origin" style={{ 
                    textAlign: 'center', 
                    width: 'inherit',
                    height: 'inherit',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    objectPosition: 'top',
                    background: meta.background || 'rgba(255,255,255,0.1)'
                }} src={meta.poster} alt=""></img>
            </div>
            <div style={{ flex: '1 0', height: '300px', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                <h3>{meta.title || query.title }</h3>
                <div style={{ maxWidth: '680px', overflow: 'auto', flex: 1 }}>
                    { meta.description }
                    { status === 'rejected'?  <div>Error</div>: status === 'pending'? <Spinner></Spinner>: null }
                </div>
                <div style={{display: 'flex' }}>
                    <select aria-label="Select meta provider" title="Select meta provider" style={{ ...msgStyles, textAlign: 'center', minWidth: '48px' }} name="meta-select" value={selected} onChange={handleChange}>
                        { tmdb_meta && <option key="tmdb" value="tmdb">{'TMDb'}</option> || null }
                        {
                            providers.map(({ id, title })=> {
                                return <option key={id} value={id}>{title || id}</option>
                            })
                        }
                    </select>

                    {/* Handle season select when video has list of seasons */}
                    <SelectSeason meta={meta} value={season} handleSeasonSelect={handleSeasonSelect}></SelectSeason>

                    {
                        // Meta has trailer
                        trailer && <button title="Play trailer" role="button" aria-label="Play trailer" style={msgStyles} title={ trailer.src || trailer.url || trailer.file || trailer.id } onClick={function () {
                            actions.setSource(trailer)
                        }}>
                        Trailer
                        </button> || null
                    }
                    {   // Non series or has direct link
                        (playDirect || meta.type === 'video' || meta.type === 'movie') && <button title="Watch now" role="button" aria-label="Watch now" style={msgStyles} title={ playDirect || meta.id } onClick={function () {
                            actions.setSource(meta)
                        }}>
                        Watch
                        </button> || null
                    }
                </div>
            </div>
        </div>
    
        {/* Display episode list */}
        { status === 'fulfilled' && meta && meta.seasons && <Seasons 
            player={player}
            meta={meta} 
            results={results} 
            providers={providers}
            userProviders={userProviders}
            actions={actions}
            query={query}>
        </Seasons> || null }
    </div>
}


function SelectSeason ({ meta, value, handleSeasonSelect }) {
    const seasons = meta && Array.isArray(meta.seasons) && meta.seasons
    const selectedSeason = value === void 0?  meta.season : value

    return seasons && <select
        title="Select season"
        aria-label="Select season"
        style={msgStyles} 
        name="season-select" 
        value={selectedSeason}
        onChange={handleSeasonSelect}>
        { seasons.map(function (season) {
            if (!season || season.season === void 0) return null

            return <option key={season.season} value={season.season}>
                { season.title || 'Season ' + season.season }
            </option>
        })}
    </select> || null
}




function Seasons ({ meta, results, actions, player, userProviders }) {
    // Return a sorted array of episodes for current season
    const metaSeason = meta.season
    const episodes = useMemo(function () {
        const map = new Map()

        for (let [key, { status, value }] of Object.entries(results)) {
            if (status === 'fulfilled' && Array.isArray(value.seasons)) 
            {
                const season = value.seasons.find(function (obj) {
                    const { season, items } = obj || {}

                    return obj && season == metaSeason && Array.isArray(items)
                })

                if (season) {
                    season.items.forEach(function (item) {
                        const { episode } = item

                        const obj = map.get(episode) || Object.create(null)

                        obj[key] = { ...item, provider: key }

                        map.set(episode, obj)
                    })
                }
            }
        }

        const episodes = [...map.keys()].sort((keyA, keyB) => keyA > keyB).map(key => map.get(key))

        console.log('generateMemoizedEpisodes', episodes)

        return episodes
    }, [results, metaSeason])

    return <div>
        <div>
            { episodes.map(function (episodeInstance) {
                const firstKey = Object.keys(episodeInstance)[0]
                const episodeNumber = episodeInstance[firstKey].episode
                const seasonNumber = Number(meta.season)

                return <LazyLoad
                    key={episodeNumber}
                    height={ 240 }
                    offsetVertical={ 240 * 2 }
                    debounce={false}
                    throttle={350}
                ><EpisodeMeta
                    player={player}
                    actions={actions}
                    userProviders={userProviders}
                    seasonNumber={seasonNumber}
                    episodeNumber={episodeNumber}
                    episode={episodeInstance} 
                    series={meta}
                ></EpisodeMeta>
                </LazyLoad>
            }) }
        </div>
    </div>
}


function EpisodeMeta ({ series, episode, seasonNumber, episodeNumber, actions, userProviders }) {
    const [selected, setSelected] = useState()    
    const provider = series.provider
    
    useEffect(function () {
        const propNames = Object.keys(episode)
        const tmdbIndex = propNames.indexOf('tmdb')
        const pref = propNames.indexOf(provider)
        const selected = propNames[pref !== -1? pref : tmdbIndex !== -1 ? tmdbIndex : 0]

        setSelected(selected)
    }, [provider, episode])

    const handleSelect = useCallback(function (evt) {
        const hasOwn = Object.prototype.hasOwnProperty
        const providerName = evt.target.value

        if (hasOwn.call(episode, providerName)) setSelected(providerName)
        else console.warn('Missing season meta provider', providerName)
    }, [episode])


    const meta = episode[selected]
    const [handlesPrefix, prefix] = useHandlesId(userProviders, meta && meta.id)

    if (!meta || selected === void 0) return null // Error

    const trailer = meta.trailer
    const playLabelText = 'Watch ' + (meta.src || meta.url || meta.file || meta.id)
    const playTrailerLabelText = trailer && 'Watch trailer ' + (trailer.src || trailer.url || trailer.file || trailer.id)

    return <div style={{ 
        borderBottom: '1px solid black', 
        padding: '1em' ,
        maxHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        height: '240px',
        // background: 'ghostwhite',
        // color: '#333'
    }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div>
                { meta.poster && <img alt="" referrerPolicy="same-origin" style={{
                    flex: '0 1 100px',
                    width: '100px',
                    margin: 'auto',
                    alignSelf: 'baseline'
                }} src={meta.poster}></img> || <div style={{
                    flex: '0 1 100px',
                    width: '100px',
                    margin: 'auto',
                    alignSelf: 'baseline',
                    background: meta.background || 'ghostwhite',
                    height: '100%'
                }}></div>
                }
            </div>
            <div style={{ flex: '1', textOverflow: 'ellipsis', margin: '1em' }}>S{ seasonNumber }E{ episodeNumber } | { meta.title }</div>
            <div role="radiogroup" tabIndex="0" style={{
                display: 'flex',
                overflow: 'hidden',
                flex: '1 0 60%',
                alignItems: 'baseline',
                justifyContent: 'end'
            }}>
                {
                    Object.keys(episode).map(function (key) {
                        if (!key) return null

                        const labelText = 'Select meta provider ' + key

                        return <div key={key} title={labelText} role="radio" aria-label={labelText} style={{
                            background: '#fff',
                            color: '#333',
                            maxWidth: '150px',
                            minWidth: '100px',
                            overflow: 'auto',
                            borderRadius: '3px',
                            textAlign: 'center',
                            padding: '0.25em',
                            textOverflow: 'ellipsis',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            alignSelf: 'baseline',
                            border: selected === key ? '3px solid orange': void 0
                        }} aria-checked={( selected === key? 'true' : 'false') } onClick={function () { handleSelect({ target: { value: key } }) }}>
                            { key }
                        </div>
                    })
                }
            </div>
        </div>
        <div style={{
            flex: '1',
            maxHeight: '240px',
            overflow: 'auto',
            // maxWidth: '100%',
            width: 1024,
            maxWidth: '100%',
            scrollbarWidth: 'thin',
            scrollbarColor: 'black #333'
        }}>{ meta.description }</div>

        <div style={{
            display: 'flex',
            // flex: '1'
        }}>

            { trailer && <button style={msgStyles} title={playTrailerLabelText} role="button" aria-label={playTrailerLabelText} style={msgStyles} onClick={function () {
                actions.setSource(meta)
            }}>Trailer</button> || null }

            { handlesPrefix && <button style={msgStyles} title={playLabelText} role="button" aria-label={playLabelText} style={msgStyles} onClick={function () {
                actions.setSource(meta)
            }}>Watch</button> || null }

            { !handlesPrefix && <div style={{...msgStyles, padding: '0.15em' }}>
                No stream provider for { prefix }
            </div> || null }
        </div>
    </div>
}
