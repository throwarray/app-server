// Acceptable meta query parameters
const acceptableParameters = [
    'id', 'title', 'type', 'provider', 
    'season', 'episode', 'year', 
    'season', 'page', 'tmdb_id', 'tmdb', 'region',
    'series'
]

function metaQueryItem (item) {
    const query = {}

    acceptableParameters.forEach(function (propName) {
        const val = item[propName]

        if (val !== void 0)  query[propName] = val
    })

    return query
}

// Filter providers by handles prefix
function filterProviders (prefixStr, providersArr, prop) {
    const prefix = parseIdPrefix(prefixStr)
    const allowed = ['streams', 'meta', 'collections', 'config'].includes(prop)
    const hasOwn = Object.prototype.hasOwnProperty

    if (!allowed) return []

    // Add system provider
    if (!prefix || prefix === 'system') {
        return [{
            title: 'System',
            id: 'system',
            url: '/api/providers/system',
            collections: ['system']
        }]
    }
    
    const providers = providersArr.filter(function ({ id }) {
        return id !== 'tmdb'
    })

    providers.push({
        title: 'TMDb', 
        id: 'tmdb',
        url: '/api/providers/tmdb', //'/providers/tmdb',
        collections: ['tmdb'],
        meta: ['*'],
        streams: ['tmdb']
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

function parseIdPrefix (id) {
    return (id || '').split('-')[0]
}

export {
    parseIdPrefix,
    filterProviders,
    metaQueryItem
}
