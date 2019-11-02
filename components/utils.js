import { fetch, formatURL, reflect, combineURLS, serverRoute } from './fetch'

import AbortController from 'abort-controller'

const hasOwn = Object.prototype.hasOwnProperty

async function fetchCollection (query, providersArr = []) {
    const id = query.id
    const prefix = (query.id || '').split('-')[0]
    const providers = [...providersArr, {}]
        
    // TODO prevent adding system provider
    let prv = filterProviders(prefix, providers, 'collections').filter(function ({ id }) { return id !== 'system' }) 

    // Add system provider
    if (!id || prefix === 'system') {
        prv.push({
            title: 'System',
            id: 'system',
            url: serverRoute('/providers/system')
        })
    }
    
    console.log('[fetch collection]', query)

    const controller = new AbortController()

    const responses = await Promise.race(
        prv.map(({ url })=> reflect(
            fetch(formatURL({
                pathname: combineURLS(url, '/collection.json'),
                query
            }), {
                signal: controller.signal
            })
        ))
    )

    const collection = await responses.value.json()
    
    Object.assign(collection, {
        id: query.id,
        title: query.title,
        paginated: query.paginated ||  query.type !== 'collection'
    })

    controller.abort()
    
    return collection
}


// Acceptable meta query parameters
function metaQueryItem (item) {
    const query = {}

    ;[
        'id', 'title', 'type', 'provider', 'season', 'episode', 'year', 'season', 'page', 'tmdb_id', 'tmdb', 'region'
    ].forEach(function (propName) {
        const val = item[propName]

        if (/*val || val === 0*/ val !== void 0)  query[propName] = val
    })

    return query
}


function filterProviders (prefix, providersArr, prop) {
    const allowed = ['streams', 'meta', 'collections', 'config'].includes(prop)
    const hasOwn = Object.prototype.hasOwnProperty

    if (!allowed) return []
    
    const providers = providersArr.filter(function ({ id }) {
        return id !== 'tmdb'
    })

    providers.push({
        title: 'TMDb', 
        id: 'tmdb',
        url: serverRoute('/providers/tmdb'),
        collections: ['tmdb'],
        meta: ['*'],
        //streams: ['tmdb']
    })

    const matched_providers = providers.filter(provider => {
        if (hasOwn.call(provider, prop)) {
            const list = provider[prop]

            if (Array.isArray(list)) 
                return !!list.find(item => item === '*' || item === prefix)
        }
    })

    return matched_providers
}

export {
    fetchCollection,
    filterProviders,
    hasOwn,
    metaQueryItem
}
