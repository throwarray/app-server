import createRouter from '../_middleware/createRouter'
import passport from '../_middleware/passport'
import { verifyToken } from '../_middleware/xsrf'

import mongoose from 'mongoose'

const router = createRouter()

const middlewares = [
    passport, 
    function withAuthentication (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({ error: true })
        } else next()
    }, 
    verifyToken
]

// Add or Edit provider
router.post(...middlewares, function addProvider (req, res) {
    const user = String(req.user && req.user.user_id)
    const { _csrf, ...body } = req.body || {}

    const providerCap = 50 // ~= max number of providers
    const Provider = mongoose.model('providers')

    function done (err) {
        if (err) res.json({ error: true /*err.message*/ })

        else res.json({ error: false })
    }

    if (typeof body.id !== 'string' ||
        typeof body.streams !== 'string' ||
        typeof body.collections !== 'string' ||
        typeof body.meta !== 'string'
    ) {
        done(new Error('Invalid'))

        return
    }

    // API route doesn't accept application/json (noscript support)
    body.streams = body.streams? body.streams.split(','): [] // avoid ['']
    body.meta = body.meta? body.meta.split(','): []
    body.collections = body.collections? body.collections.split(','): []

    // Add or modify existing provider
    Provider.countDocuments({ user }, function (err, count) {
        if (err) done(new Error('Failed to handle request.'))

        else if (count >= providerCap) done(new Error('Provider limit reached.'))
        
        else new Provider({ ...body, user }).validate(function (err) {
            if (!err) Provider.updateOne(
                { user, id: body.id }, 
                { ...body, user },
                { upsert: true }, 
                done
            )
            else done(err)
        })
    })
})

// Remove provider
router.delete(...middlewares, async function removeProvider (req, res) {
    const db = req.db
    const user = String(req.user.user_id)
    const { _csrf, ...body } = req.body || {}
    const id = body && body.id

    try {
        if (typeof id !== 'string') throw new Error('Error')

        await db.collection('providers').deleteOne({ user, id })

        res.json({ error: false })
    } catch (_err) {
        res.json({ error: true })
    }
})

export default router