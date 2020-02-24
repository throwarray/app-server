import session from 'next-session'

import connectMongo from 'connect-mongo'

import database from './database'

const MongoStore = connectMongo(session)

const usesHttps = (process.env.APP_URL || '').startsWith('https://')

export default function (req, res, next) {
    database(req, res, function (err) {
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
            store: new MongoStore({
                // client: req.dbClient,
                // stringify: false,
                mongooseConnection: req.dbClient
            })
        })(req, res, next)
    })
}