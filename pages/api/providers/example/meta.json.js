import { namespace, notFound } from './_utils'

export default async function (req, res) {    
    const query = req.query

    const id = query.id

    if (id === namespace + '-bbb') res.json({
        id,
        title: 'Big Buck Bunny',
        description: 'Big Buck Bunny (clip)',
        poster: '/poster_bbb.jpg',
        type: 'movie'
    })

    else notFound(req, res)
}

//// When dealing with series...
//// You can skip populating episodes for seasons that don't match the seasonNumber query
// const seasonNumber = Number(query.season) || 1
// {
//     ...,
//     type: 'series',
//     season: seasonNumber,
//     seasons: [
//         { season: 1, episodes: [] },
//         { season: 2, episodes: [
//             {
//                 id,
//                 title: 'Season 2',
//                 season: 2,
//                 episode: 1,
//                 description,
//                 poster
//             },
//         ] }
//     ]
// }