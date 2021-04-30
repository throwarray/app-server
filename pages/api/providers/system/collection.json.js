import createRouter from '../../_middleware/createRouter'
import passport from '../../_middleware/passport'

const router = createRouter()

router.use(passport)

router.get(async function (req, res, next) {
    let collection
    let providers
    let isError

    const { query = {}, db, user } = req
    const user_id = user && user.user_id || ''
    const id = query.id || ''

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
                    { title: 'Bookmarks', id: 'system-fav' },
                    { title: 'Popular Movies', type: 'collection', id: 'tmdb-movie-popularity.desc' },
                    { title: 'Popular Series', type: 'collection', id: 'tmdb-series-popularity.desc' }
                ]
            }
        
        break

        case 'system-fav': 
            if (user_id) providers = await db
                .collection('playlistitems')
                .find({ user: user_id, playlist: 'system-fav' }).toArray()
            
            providers = providers || []

            collection = {
                id: 'system-fav',
                title: 'Bookmarks',
                items: providers.map(function (item) {
                    return item
                }),
                pageCount: 1
            }

        break
        
        case 'system-providers':
            if (user_id) providers = await db
                .collection('providers')
                .find({ user: user_id }).toArray() || []
                
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
            if (user_id) providers = await db.collection('collections').find({ user: user_id }).toArray() || []
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

    if (collection && !isError) {
        res.json(collection)
    } else {
        res.status(404)
        res.end('')
    }
})

//export default (req, res) => router.apply(req, res)
export default router