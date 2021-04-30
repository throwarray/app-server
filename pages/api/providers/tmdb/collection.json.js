import { combineURLS, Discover } from './_lib.js'

const { promisify } = require('util')
const getDiscoverAsync = promisify(Discover)

export default async function API_TMDB_Collection (req, res) {
    const query = req.query || {}
    const page = Number(query.page) || 1
    const id = query.id || 'tmdb'

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
        res.json({})
        return
    }

    const [collectionType, collectionQuery] = collectionId.split('-')

    let data; try {
        data = await getDiscoverAsync({ type: collectionType, sort_by: collectionQuery, page })
    } catch (e) {
        res.status(404)
        res.json({})
        return
    }

    // Transform response into collection format
    const {
        page: pageN,
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

        if (item.poster_path) out.poster = combineURLS(
            'https://image.tmdb.org/t/p/w200', 
            item.poster_path
        )

        return out
    })

    res.json({
        id,
        items,
        page: pageN,
        total_pages,
        total_results
    })
}