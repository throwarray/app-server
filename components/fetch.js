const AbortController = require('abort-controller')

const fetch = require('isomorphic-unfetch')

const { format : formatURL, parse : parseURL } = require('url')

const { stringify: stringifyQuery } = require('querystring')

const stripPrefix = /^(\/|\.{1,}\/)+/

const APP_URL = process.env.APP_URL || 'http://localhost:3000'

const parsedAppURL = parseURL(APP_URL)

const reflect = p => p.then(v => ({ value: v, status: 'fulfilled' }), e => ({ value: e, status: 'rejected' }))

function serverRoute (providedPath = '') {
    let { search, pathname } = parseURL(providedPath, true)

    return formatURL({ 
        protocol: parsedAppURL.protocol, 
        host: parsedAppURL.host, 
        pathname: pathname.replace(stripPrefix, ''), 
        search 
    })
}

function combineURLS(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

function formBody (obj) {
    return Object.keys(obj).map(function (key) {
        const val = obj[key]
        const k = global.encodeURIComponent(key)
        
        if (val === void 0)
        return k === void 0 ? '' : k
        else
        return `${k}=${global.encodeURIComponent(val)}`
    }).join('&')
}

module.exports = {
    reflect,
    fetch,
    combineURLS,
    AbortController,
    stringifyQuery,
    serverRoute,
    formatURL,
    formBody,
    parseURL
}