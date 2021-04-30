import { Search, combineURLS } from './_lib.js'
import { promisify } from 'util'
const getSearchAsync = promisify(Search)

// WIP
export default async function API_TMDB_Search (req, res) {
    // let season = req.query.season === void 0 ? 1 : Number(req.query.season)

    let mediaType = String(req.query.type) || void 0
    
    const title = String(req.query.title) || void 0
    
    const year = Number(req.query.year) || void 0

    const query = { query: title, type: mediaType }

    if (req.query.region) query.region = String(req.query.region)
        
    if (year !== void 0) query.year = year

    if (mediaType === 'episode') mediaType = 'series'

    else if (mediaType === 'video') mediaType = 'movie'

    const { body } = await getSearchAsync(query)

    const { results } = body

    const items = results.map(item=> {
        const out = {
            title: item.title || item.name, // movie | series
            tmdb_id: item.id,
            id: 'tmdb-' + Number(item.id),
            year: Number(item.year) || new Date(item.release_date || item.first_air_date).getFullYear(), // movie | series
            release_date: item.release_date || item.first_air_date,
            type: mediaType
        }

        if (item.poster_path) out.poster = combineURLS(
            'https://image.tmdb.org/t/p/w200', 
            item.poster_path
        )

        return out
    })

    res.json({
        id: 'tmdb-search-' + encodeURIComponent(title), // dunno
        items,
        page: 1,
        total_pages: 1,
        total_results: items.length
    })
}