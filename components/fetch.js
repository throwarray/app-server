// Used in node: Don't convert to es module syntax

const AbortController = require('abort-controller')

const originalFetch = require('isomorphic-unfetch')

const { format : formatURL, parse : parseURL } = require('url')

const { stringify: stringifyQuery } = require('querystring')

const stripPrefix = /^(\/|\.{1,}\/)+/

const APP_URL = process.env.APP_URL || 'http://localhost:3000'

const parsedAppURL = parseURL(APP_URL)

const reflect = p => p.then(v => ({ value: v, status: 'fulfilled' }), e => ({ value: e, status: 'rejected' }))

let freeAgent

function serverRoute (providedPath = '') {
    let { search, pathname } = parseURL(providedPath, true)

    return formatURL({ 
        protocol: parsedAppURL.protocol, 
        host: parsedAppURL.host, 
        pathname: pathname.replace(stripPrefix, ''), 
        search 
    })
}

if (!process.browser) {
    const https = require('https')
    
    freeAgent = https.Agent({ rejectUnauthorized: false })
}

const empty = {}

function fetch (url = '', options = empty) {
    const parsed = parseURL(typeof url === 'object' ? url.toString() : url)
    const optionsDefault = {}

    if (!parsed.host) {
        parsed.protocol = parsedAppURL.protocol
        parsed.host = parsedAppURL.host
        parsed.hostname = parsedAppURL.hostname
        parsed.port = parsedAppURL.port
        parsed.href = null
    }

    if (
        freeAgent &&
        parsedAppURL.protocol === 'https:' &&
        parsed.host === parsedAppURL.host && 
        parsed.hostname === parsedAppURL.hostname &&
        parsed.protocol === 'https:'
    ) options.agent = freeAgent

    return originalFetch(formatURL(parsed), { 
        ...optionsDefault, 
        ...options 
    })
}

function combineURLS(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

module.exports = {
    reflect,
    fetch,
    combineURLS,
    AbortController,
    stringifyQuery,
    serverRoute,
    formatURL,
    parseURL
}