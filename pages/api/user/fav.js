import createRouter from '../_middleware/createRouter'
import passportMiddleware from '../_middleware/passport'
import { verifyToken } from '../_middleware/xsrf'

import mongoose from 'mongoose'

const router = createRouter()

const middleware = [
    passportMiddleware,
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({ error: true })
        } else next()
    }
]

router.post(...middleware, verifyToken, function (req, res) {
    const { _csrf, ...body } = req.body || {}

    const doc = {
        ...body,
        id: String(body.id), 
        user: String(req.user.user_id), 
        playlist: 'system-fav',
        date: Date.now()
    }

    const PlaylistItem = mongoose.model('playlistitems')
    const playlistItem = new PlaylistItem(doc)

    function handleDone (err) {
        if (err) {
            res.status(500)
            res.json({ error: true })
        }

        else res.json({ value: true })
    }

    playlistItem.validate(function (err) {
        if (!err) PlaylistItem.updateOne({
            user: doc.user,
            playlist: 'system-fav',
            id: doc.id
        }, doc, { upsert: true }, handleDone)
        
        else handleDone(err)
    })
})

router.get(...middleware, async function (req, res, next)  {
    let hasItem

    const { user, query, body, db } = req

    try {
        const id = String(query.id || body.id || '')

        hasItem = await db.collection('playlistitems').findOne({ 
            user: String(user.user_id),
            playlist: 'system-fav', 
            id
        })

        res.json({ value: !!hasItem })
    }  catch (err) {
        err.status = 500
        next(err)
    }    
})

router.delete(...middleware, verifyToken, async function (req, res) {
    const { user, query, body, db } = req
    
    try {
        const id = String(query.id || body.id || '')

        await db.collection('playlistitems').findOneAndDelete({ 
            user: String(user.user_id), 
            playlist: 'system-fav', 
            id
        })

        res.json({ value: false })
    } catch (err) {
        res.status(500)
        res.json({ error: true })
        return
    }
})

export default router