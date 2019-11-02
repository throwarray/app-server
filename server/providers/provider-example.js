const namespace = 'example'
const wrapProvider = require('./wrap-provider')

/**
 * For simplicity `js` files prefixed with `provider-` are wrapped and mounted automatically 
 * when they export a `routes` object i.e { streams, meta, ... }
 *
 * When you need more control you can export a router instead and it'll be mounted to /providers/example
 * const express = require('express')
 * const router = express.Router()
 * router.get('/collection.json', function () { ... })
 * router.get('/meta.json', function () { ... })
 * router.get('/streams.json', function () { ... })
 * router.get('/some-route', function () { ... })
 * module.exports = async function () { return router }
 * 
 * Or you can wrap the `routes` yourself and augment the router like in this example
 */

module.exports = async function () {
    const { router } = await wrapProvider({ collection, streams, meta })

    return router
}



async function collection ({ query }) {
    const id = query.id

    //const page = query.page

    if (id === namespace)
        return {
            id,
            page: 1,
            items: [
                {
                    id: namespace + '-bbb',
                    type: 'movie',
                    title: 'Big Buck Bunny',
                    background: 'blue',
                    poster: '/poster_bbb.jpg'
                }
            ]
        }
}

// Provide meta info for mediaId
async function meta ({ query }) {
    const id = query.id

    if (id === namespace + '-bbb') {
        return {
            id,
            title: 'Big Buck Bunny',
            description: 'Big Buck Bunny (clip)',
            poster: '/poster_bbb.jpg',
            type: 'movie'
        }
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
}


// Provide a list of streams for mediaId
async function streams ({ query }) {
    const id = query.id

    if (id === namespace + '-bbb') 
        return [
            { 
                url: '/mov_bbb.mp4', 
                type: 'mp4' 
            }
        ]
}
