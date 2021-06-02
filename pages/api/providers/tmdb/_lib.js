const fetch = require('isomorphic-unfetch')

const { URL } = require('url')

const auth = {
    v3: process.env.TMDB_V3,
    v4: process.env.TMDB_V4
}    

const defaultSearchOpts = {
    include_adult: true,
    page: 1,
    language: 'en-US'
}

function combineURLS (baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

module.exports = {
    Search,
    Meta,
    Season,
    Discover,
    config, 
    combineURLS
}

function config (props) {
    Object.assign(auth, props)
}

function Search ({ type = 'movie', ...opts }, cb) {
    if (!type || !opts.query) cb(new Error('Invalid query'))
    
    else {
        let url
        
        switch (type) {
            case 'movie': url = 'https://api.themoviedb.org/3/search/movie'; break
            case 'series':
            case 'tv': url = 'https://api.themoviedb.org/3/search/tv'; break
        }
        
        if (!url) cb(new Error('Invalid query'))
    
        else {
            fetchJSON({
                url,
                qs: Object.assign({ api_key: auth.v3 }, defaultSearchOpts, opts)
            }, cb)
        }
    }
}

// Handle meta for series / movie
function Meta ({ 
    id, 
    type,
    ...opts 
}, cb) {
    if (!type) cb(new Error('Invalid query'))
    
    else {
        let url, tmdbId = Number(id)

        switch (type) {
            case 'movie': 
                url = `https://api.themoviedb.org/3/movie/${tmdbId}`; break
            case 'series':
            case 'tv': 
                url = `https://api.themoviedb.org/3/tv/${tmdbId}`; break
        }

        if (Number.isNaN(tmdbId) || !url) cb(new Error('Invalid query'))

        else {
            fetchJSON({
                url,
                qs: Object.assign({ 
                    api_key: auth.v3,
                    language: 'en-US',
                    append_to_response: 'videos,images,external_ids,content_ratings,keywords,credits'
                }, opts)
            }, cb)
        }
    }
}

// Handle meta for season / episode
function Season ({ id, season, episode, ...opts }, cb) {
    const seasonNumber = Number(season)

    const tvId = Number(id)

    const options = {
        url: `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}`,
        qs: Object.assign({ 
            api_key: auth.v3,
            language: 'en-US',
            append_to_response: 'videos,images,external_ids,content_ratings,keywords,credits'
        }, opts)
    }

    if (episode !== void 0) options.url = options.url + '/episode/' + Number(episode)

    if (Number.isNaN(seasonNumber) || Number.isNaN(tvId)) cb(new Error('Invalid Request'))
    
    else fetchJSON(options, cb)
}

function Discover ({ type, ...opts }, cb) {
    let url
    
    switch (type) {
        case 'movie': url = 'https://api.themoviedb.org/3/discover/movie'; break
        case 'series':
        case 'tv': url = 'https://api.themoviedb.org/3/discover/tv'; break
    }

    fetchJSON({ url, qs: { ...defaultSearchOpts, api_key: auth.v3, ...opts } }, cb)
}


function fetchJSON ({ url, qs = {}, method = 'GET', json, ...otherProps }, cb) {
    let route, iterable

    try {
        route = new URL(url)

        // Support Map and URLSearchParams
        iterable = qs.__proto__.entries? qs.entries() : Object.entries(qs)
    
        // Add query params
        for (let [key, value] of iterable) { route.searchParams.set(key, value) }
    } catch(e) {
        cb(new Error('Invalid Request'))
        return
    }

    // Fetch JSON and return response
    (async function () {
        const response = await fetch(route, { method, ...otherProps })
        const body = await response.json()
        cb(void 0, { response, body })
    })().catch((error)=> cb(error))
}