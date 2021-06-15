import { randomBytes } from 'crypto'

import { parse as parseCookie, serialize as serializeCookie } from 'cookie'

import { URL } from 'url'

const USE_SECURE_COOKIES = (process.env.APP_URL || '').startsWith('https://')

const COOKIE_PREFIX = USE_SECURE_COOKIES? '__Host-' : ''

export const XSRF_COOKIE_NAME = COOKIE_PREFIX + 'XSRF-TOKEN'

async function generate (_req, _res) {
    const token = randomBytes(16).toString('base64')

    return token
}

export function assignToken (_req, res, next) {
    generate(_req, res).then(function (token) {
        res.setHeader('Set-Cookie', serializeCookie(XSRF_COOKIE_NAME, token, {
            path: '/',
            secure: USE_SECURE_COOKIES,
            sameSite: 'lax',
            httpOnly: false,
            maxAge: process.env.SESSION_COOKIE_LIFETIME || 30 * 86400000 // 30 days
        }))

        next()
    }).catch(next)
}

export function revokeToken (_req, res, next) {
    res.setHeader('Set-Cookie', serializeCookie(XSRF_COOKIE_NAME, '', {
        path: '/',
        secure: USE_SECURE_COOKIES,
        httpOnly: false,
        expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT')
    }))

    next()
}

async function verify (req, _res) {
    let cookies = req.cookies

    if (!cookies) cookies = parseCookie(req.headers.cookie)

    const expected = cookies[XSRF_COOKIE_NAME]

    const is_origin = req.headers.origin === new URL(process.env.APP_URL).origin

    const header_match = req.headers['x-xsrf-token'.toLowerCase()] === expected

    const body_match = req.body && req.body._csrf === expected

    return expected && is_origin && (header_match || body_match)
}

export function verifyToken (req, _res, next) {
    verify(req, _res).then(function (isValid) {
        if (!isValid) {
            const error = new Error('Unauthorized')

            error.status = 401

            throw error
        } else next()
    }).catch(next)
}
