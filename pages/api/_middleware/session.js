import { session } from 'next-session'

import MongoStore from 'connect-mongo'

import databaseMiddleware from './database'

const usesHttps = (process.env.APP_URL || '').startsWith('https://')

export default function sessionMiddleware (req, res, next) {
    databaseMiddleware(req, res, function (err) {
        if (err) return next(err)

        else if (req.session) return next()

        else session({
            name: 'session',
            storePromisify: true,
            secret: process.env.SESSION_COOKIE_SECRET || 'keyboard cat',
            cookie: {
                httpOnly: true,
                secure: usesHttps,
                sameSite: false
            },
            store: MongoStore.create({
                clientPromise: req.clientPromise,
                // autoRemove: 'interval',
                // autoRemoveInterval: 1
                // stringify: false,
            })
        })(req, res, next)
    })
}