const mongoose = require('mongoose')

async function collection (req) {
    let collection
    let providers
    let isError
    const { user, query = {} } = req
    const id = query.id || ''
    const authed = req.isAuthenticated() /* not bound */ && user && user.user_id

    switch (id) {
        case '':
        case 'system-home':
            collection = {
                id: 'system-home',
                title: 'Home',
                type: 'collection',
                items: [
                    { 
                        id: 'system-providers', 
                        type: 'collection',
                        title: 'Providers',
                        height: 50,
                        width: 100,
                    },
                    { title: 'Popular Movies', type: 'collection', id: 'tmdb-movie-popularity.desc' },
                    { title: 'Popular Series', type: 'collection', id: 'tmdb-series-popularity.desc' }
                    // { 
                    //     id: 'system-playlists', 
                    //     type: 'collection',
                    //     title: 'Playlists'
                    // }
                ]
            }
        
        break
        
        case 'system-providers':
            if (authed) providers = await mongoose.model('providers').find({ user: authed }) || []
            else providers = []

            collection = {
                id: 'system-providers',
                title: 'Providers',
                type: 'collection',
                items: providers.map(function (provider) {
                    return {
                        title: provider.title || provider.id,
                        id: provider.id, 
                        type: 'collection',
                        background: 'darkorange'
                    }
                })
            }
        
        break
        
        case 'system-playlists':
            if (authed) providers = await mongoose.model('collections').find({ user: authed }) || []
            else providers = []

            collection = {
                id: 'system-playlists',
                title: 'Playlists',
                type: 'collection',
                items: providers.map(function (provider) {
                    return {
                        title: provider.title || provider.id,
                        id: provider.id, 
                        type: 'collection',
                        background: 'darkorange'
                    }
                })
            }
        
        break
        
        default:
        
        isError = true

        break
    }

    if (collection && !isError) return collection
}

async function meta (/*{ query }*/) {}

async function streams (/*{ query }*/) {}

module.exports = {
    collection,
    meta, 
    streams
}
