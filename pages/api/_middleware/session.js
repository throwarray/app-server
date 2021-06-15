import session from 'express-session'

import MongoStore from 'connect-mongo'

import databaseMiddleware from './database'

const USE_SECURE_COOKIES = (process.env.APP_URL || '').startsWith('https://')

export function destroySession (req, res, next) {
    // Removes req.user, and clears the `session.passport` value from the session.
    if (req.logout) req.logout()

    // Destroy the session
    req.session.destroy(function (err) {
        // Expire the session cookie.
        res.setHeader('Set-Cookie', 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly')

        next(err)
    })
}

export default function sessionMiddleware (req, res, next) {
    databaseMiddleware(req, res, function (err) {
        if (err) return next(err)

        else if (req.session) return next()

        const store = MongoStore.create({
            clientPromise: req.clientPromise,
            stringify: false
        })

        return session({
            name: 'connect.sid',
            secret: process.env.SESSION_SECRET,
            cookie: {
                httpOnly: true,
                secure: USE_SECURE_COOKIES,
                sameSite: 'Lax',
                maxAge: process.env.SESSION_COOKIE_LIFETIME || 30 * 86400000 // 30 days
            },
            store,
            resave: false,
            saveUninitialized: false,
        })(req, res, next)
    })
}