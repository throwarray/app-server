const express = require('express')

const { Search, Season, Meta, Discover } = require('./lib-tmdb')

const { promisify } = require('util')

const { get: levenshtein } = require('fast-levenshtein')

const router = express.Router()

const handleReqAsync = fn => (...args) => fn(...args).catch(args[2])

const getMetaAsync = promisify(Meta)

const getSeasonAsync = promisify(Season)

const getSearchAsync = promisify(Search)

function StrOrVoid (input) { return (input === void 0? input : String(input)) || void 0 } // strip empty str

function NumOrVoid (n) { const num = Number(n); if (!Number.isNaN(num)) return num }

function getTrailer (item) {
    const trailer = item.videos && item.videos.results.find(video => { return video.key && video.type === 'Trailer' && video.site === 'YouTube' })

    if (trailer) return { 
        type: 'video/youtube',
        file: `https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}`
    }

    //return trailer
}

function combineURLS (baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

// Get meta for series / movie
// Finds nearest match based on mediaType, title and year when missing id

function getNearestMatchOfResults (query, items, maxLevDist = 6) {
    if (Array.isArray(items)) {
        let nearest

        items.forEach(function (item) {
            const { name, title } = item

            let termDistance = levenshtein(query.query, name || title, { useCollator: true })
    
            if (termDistance < maxLevDist) {
                if (query.year !== void 0) {
                    const itemYear = Number(item.year || new Date(item.release_date || item.first_air_date).getFullYear()) || 0

                    termDistance += Math.abs(query.year - itemYear) * maxLevDist
                }

                if (!nearest || !termDistance || termDistance <= nearest.distance) {
                    if (!nearest) nearest = {}
                    nearest.distance = termDistance
                    nearest.value = item
                }
            }
        })
    
        if (nearest) return nearest
    }
}

router.get('/meta.json', handleReqAsync(async function (req, res) {
    let id
    let season = req.query.season === void 0? 1 : Number(req.query.season)
    let mediaType = StrOrVoid(req.query.type)

    const title = StrOrVoid(req.query.title)
    const year = NumOrVoid(req.query.year)

    if (mediaType === 'episode') mediaType = 'series'
    else if (mediaType === 'video') mediaType = 'movie'

    if (!(req.query.id || '').startsWith('tmdb')) {
        const query = { query: title, type: mediaType }

        if (req.query.region) query.region = StrOrVoid(req.query.region)
        
        if (year !== void 0) query.year = year

        const { body } = await getSearchAsync(query)
 
        const { results: items } = body

        const nearest = getNearestMatchOfResults(query, items)

        if (!nearest) throw new Error('Invalid nearest query')

        else id = Number(nearest.value.id)
    } else {
        id = Number((req.query.id || '').replace(/^tmdb-/, ''))
    }

    const { body: item } = await getMetaAsync({ id, type: mediaType })
    
    const tmdb_id = NumOrVoid(item.id || id)

    const output = {
        poster: item.poster_path? combineURLS('https://image.tmdb.org/t/p/w200', item.poster_path): void 0,
        trailer: getTrailer(item),
        title: StrOrVoid(item.title || item.name || title), // movie | series
        description: StrOrVoid(item.overview || item.description),
        tmdb_id,
        imdb_id: StrOrVoid(item.external_ids.imdb_id),
        tvdb_id: NumOrVoid(item.external_ids.tvdb_id),
        id: tmdb_id? 'tmdb-' + Number(item.id) : void 0,
        year: NumOrVoid(item.year || new Date(item.release_date || item.first_air_date).getFullYear()), // movie | series
        release_date: StrOrVoid(item.release_date || item.first_air_date),
        type: StrOrVoid(mediaType),
        // TODO additional meta, actors, genres ...
        _dev: item
    }
    
    // Note episode meta is populated from season query. 
    // TODO handle episode meta without season query
    if (mediaType == 'series' || mediaType == 'episode') {
        try {
            const { body } = await getSeasonAsync({ id, season })

            item.season = body
        } catch (e) {
            item.season = null
        }

        const season_meta = item.season

        const seasons = item.seasons? item.seasons.map(season => {
            const meta = {
                type: 'season',
                poster: season.poster_path? combineURLS('https://image.tmdb.org/t/p/w200', season.poster_path): void 0,
                title: StrOrVoid(season.name),
                description: StrOrVoid(season.overview),
                year: NumOrVoid(new Date(season.air_date).getFullYear()),
                tmdb_id: NumOrVoid(season.id),
                season: NumOrVoid(season.season_number),
                number_of_episodes: NumOrVoid(season.episode_count),
                release_date: StrOrVoid(season.air_date)
            }

            if (season_meta && season.season_number == season_meta.season_number) {
                const externalIds = season_meta.external_ids || Object.create(null)

                Object.assign(meta, {
                    imdb_id: StrOrVoid(externalIds.imdb_id),
                    tvdb_id: NumOrVoid(externalIds.tvdb_id),
                    trailer: getTrailer(season),
                    items: season_meta.episodes.map(function (episode) {
                        return {
                            type: 'episode',
                            episode: NumOrVoid(episode.episode_number),
                            season: NumOrVoid(season_meta.season_number),
                            // series: tmdb_id
                            id: 'tmdb-' + Number(episode.id),
                            tmdb_id: NumOrVoid(episode.id),
                            title: StrOrVoid(episode.name),
                            description: StrOrVoid(episode.overview),
                            release_date: StrOrVoid(episode.air_date),
                            year: NumOrVoid(new Date(episode.air_date).getFullYear()),
                            poster: episode.still_path? combineURLS('https://image.tmdb.org/t/p/w200', episode.still_path): void 0,
                            trailer: getTrailer(episode),
                            _dev: episode // TODO
                        }
                    })
                })
            }
            
            return meta
        }) : void 0

        Object.assign(output, {
            number_of_episodes: NumOrVoid(item.number_of_episodes),
            number_of_seasons: NumOrVoid(item.number_of_seasons),
            season,
            seasons,
            episode: NumOrVoid(req.query.episode)
        })
    }
    
    res.json(output)
}))

// TODO Fetch meta and respond with trailers
router.get('/streams.json', (req, res)=> {
    //res.status(404)
    //res.json([])
    
    res.json([
        {
            title: 'Big Buck',
            file: '/mov_bbb.mp4',
            type: 'mp4'
        },
        {
            'type': 'video/youtube', 
            'file': 'https://www.youtube.com/watch?v=xjS6SftYQaQ'
        }, 
        {
            file: 'https://s3.amazonaws.com/_bc_dml/example-content/sintel_dash/sintel_vod.mpd',
            type: 'application/dash+xml'
        },
        {
            file: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8', 
            type: 'application/x-mpegurl'
        }
    ])
})

router.get('/collection.json', (req, res)=> {
    const query = req.query || {}
    const page = Number(query.page) || 1
    const id = query.id

    if (id === 'tmdb') {
        return res.json({
            id,
            type: 'collection',
            title: 'TMDb',
            items: [
                { title: 'Popular Movies', type: 'collection', id: 'tmdb-movie-popularity.desc' },
                { title: 'Popular Series', type: 'collection', id: 'tmdb-series-popularity.desc' }
            ]
        })
    }

    const matched = id.match(/^([^-]+)-(.+)$/)
    const [,, collectionId] = matched || []

    if (!matched || !collectionId) { 
        res.status(404)
        return res.json({})
    }

    const [collectionType, collectionQuery] = collectionId.split('-')

    Discover({ type: collectionType, sort_by: collectionQuery, page }, function (err, data) {
        if (err) {
            res.status(404)
            return res.json({})
        }

        // Transform response into collection format
        const {
            page,
            total_pages,
            total_results,
            results = []
        } = data.body

        const items = results.map(item=> {
            const out = {
                title: item.title || item.name, // movie | series
                tmdb_id: item.id,
                id: 'tmdb-' + Number(item.id),
                year: Number(item.year) || new Date(item.release_date || item.first_air_date).getFullYear(), // movie | series
                release_date: item.release_date || item.first_air_date,
                type: collectionType
            }

            if (item.poster_path) out.poster = combineURLS('https://image.tmdb.org/t/p/w200', item.poster_path)

            return out
        })

        res.json({
            id,
            items,
            page,
            total_pages,
            total_results
        })
    })
})

module.exports = router
