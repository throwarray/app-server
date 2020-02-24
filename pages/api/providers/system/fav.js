import connectNext from 'next-connect'

import passport from '../../_middleware/passport'
import mongoose from 'mongoose'

const router = connectNext()

router.use(
    passport,
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({
                message: 'Unauthorized',
                error: true
            })
        } else next()
    }
)

router.post(function (req, res) {
    const userId = req.user.user_id
    const body = req.body
    const doc = {
        ...body, 
        user: userId, 
        playlist: 'system-fav',
        date: Date.now()
    }

    const PlaylistItem = mongoose.model('playlistitems')
    const playlistItem = new PlaylistItem(doc)

    function handleDone (err) {
        if (err) res.json({ value: false })

        else res.json({ value: true })
    }

    playlistItem.validate(function (err) {
        if (!err) PlaylistItem.updateOne({
            user: '' + userId,
            playlist: 'system-fav',
            id: '' + body.id
        }, doc, { upsert: true }, handleDone)
        
        else handleDone(err)
    })
})


router.get(async function (req, res)  {
    let hasItem

    const { user, query, body, db } = req

    try {
        hasItem = await db.collection('playlistitems').findOne({ 
            user: '' + user.user_id,
            playlist: 'system-fav', 
            id: '' + (query.id || body.id)
        })
    } finally {
        res.json({
            value: !!hasItem
        })
    }
})

router.delete(async function (req, res) {
    const { user, query, body, db } = req

    try {
        await db
            .collection('playlistitems')
            .findOneAndDelete({ 
                user: '' + user.user_id, 
                playlist: 'system-fav', 
                id: query.id || body.id 
        })
    } finally {
        res.json({
            value: false
        })
    }
})

export default (req, res) => router.apply(req, res)