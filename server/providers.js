const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const bodyParser = require('body-parser')

const path = require('path')

const { getProvidersFromDirectory } = require('./providers/lib.js')
 
const wrapProvider = require('./providers/wrap-provider')

const withFormBody = bodyParser.urlencoded({ extended: false })


const providerId = (required, wildcard) => { 
    const reg = wildcard? /^(?:(?:\w+\b)|\*)$/ : /^\w+\b$/

    return {
        type: String,
        required: !!required,
        maxLength: 16, 
        minLength: 1,
        validate: {
            validator: v => reg.test(v),
            message: props => `${props.value} is not a valid provider id!`
        },
    }
}

function providerIdCap(val) {
    return Array.isArray(val) && val.length <= 25
}

const arrayOfProviderId =()=> { 
    return {
        type: [providerId(false, true)],
        validate: [providerIdCap, '{PATH} exceeds the limit of allowed providers']
    }
}

const providerSchema = new mongoose.Schema({
    user: { type: String, required: true },
    url: { type: String, required: true, maxLength: 500 },
    id: providerId(true),
    title: { type: String, maxLength: 50 },
    meta: arrayOfProviderId(), 
    streams: arrayOfProviderId(),
    collections: arrayOfProviderId()
})

providerSchema.index({ user: 1, id: 1 }, { unique: true })

const Provider = mongoose.model('providers', providerSchema)

router.use('/api/providers/remove', withFormBody, function (req, res) {
    const body = req.body

    function done (err) {
        if (err) res.json({ type: 'error', value: 'Error' })

        else res.json({ type: 'success', value: 'Success' })
    }

    if (!body || typeof body.id !== 'string' || !req.isAuthenticated()) {
        done(true)
        return
    }

    Provider.deleteOne({
        user: req.user.user_id,
        id: body.id
    }, done)
})



// const playlistSchema = new mongoose.Schema({
//     user: { type: String, required: true },
//     id: { type: String, required: true, maxlength: 500 }
// })

const itemSchema = new mongoose.Schema({
    playlist: {  type: String, required: true, maxlength: 500 },

    user: { type: String, required: true, maxlength: 500 },

    date: { type: Date },

    id: { type: String, required: true, maxlength: 500 },

    tmdb_id: { type: String, maxlength: 100 },

    type: {
        type: String, 
        required: true,
        validate: [
            function (v) {
                return v === 'movie' || v === 'series'
            },
            'Invalid item type'
        ]
    },

    title: { type: String, required: true, maxlength: 500 },

    poster: { type: String, maxlength: 1000 },

    year: {
        type: Number, 
        validate: [
            function (v) { 
                return /^[0-9]{4,5}$/.test(v) 
            },
            'Invalid year'
        ]
    }
})


const PlaylistItem = mongoose.model('playlistitems', itemSchema)

function ensureAuthed (req, res, next) {
    if (!req.isAuthenticated() || !req.user || !req.user.user_id) {
        res.status(401)
        res.end('')
        
        return
    }

    next()
}

router.get('/api/fav', ensureAuthed, withFormBody, function (req, res) { // Add Fav
    const userId = req.user.user_id
    const { query, body } = req

    PlaylistItem.findOne({ user: userId, playlist: 'system-fav', id: query.id || body.id }, function (err, doc) {
        if (err || !doc) res.json({
            value: false
        })

        else res.json({
            value: true
        })
    })
})

router.delete('/api/fav', ensureAuthed, withFormBody, function (req, res) { // Remove Fav
    const userId = req.user.user_id
    const { query, body } = req

    PlaylistItem.findOneAndDelete({ user: userId, playlist: 'system-fav', id: query.id || body.id }, function (err, doc) {
        res.json({
            value: false
        })
    })
})

router.post('/api/fav', ensureAuthed, withFormBody, function addToFavs (req, res, next) {
    const userId = req.user.user_id
    const body = req.body
    const doc = {
        ...body, 
        user: userId, 
        playlist: 'system-fav',
        date: Date.now()
    }

    const playlistItem = new PlaylistItem(doc)

    function handleDone (err) {
        if (err) res.json({
            value: false
        })

        else res.json({
            value: true
        })
    }

    playlistItem.validate(function (err) {
        if (!err) PlaylistItem.updateOne({
            user: userId,
            playlist: 'system-fav',
            id: body.id
        }, doc, { upsert: true }, handleDone)
        else handleDone(err)
    })
})













module.exports = async function (/*cfg*/) {
    router.use('/api/providers/add', withFormBody, function (req, res) {
        const userId = req.user && req.user.user_id
        const body = req.body
        const providerCap = 25
        
        function done (err) {
            if (err) res.json({ type: 'error', value: err })
            else res.json({ type: 'success', value: 'Success' })
        }

        if (!body || typeof body.id !== 'string' || !userId || !req.isAuthenticated()) {
            done(new Error('Failed to handle request.'))
            return
        }

        if (typeof body.streams === 'string') body.streams = body.streams.split(',')
        if (typeof body.collections === 'string') body.collections = body.collections.split(',')
        if (typeof body.meta === 'string') body.meta = body.meta.split(',')

        // Add or modify existing provider
        Provider.countDocuments({ user: userId }, function (err, count) {
            if (err) 
                done(new Error('Failed to handle request.'))

            else if (count >= providerCap) 
                done(new Error('Provider limit reached.'))
            
            else  new Provider({ ...body, user: userId  }).validate(function (err) {
                if (!err) Provider.updateOne(
                    { user: userId, id: body.id }, 
                    { ...body, user: userId }, 
                    { upsert: true }, 
                    done
                )
                else done(err)
            })
        })
    })

    router.use('/providers/tmdb', require('./providers/router-tmdb'))

    const providerDir = path.join(__dirname, './providers/')
    const providers = await getProvidersFromDirectory(providerDir)

    // Mount providers and retain configs
    for (let [, { id, filename }] of Object.entries(providers)) {
        try {
            const { router: mount } = await wrapProvider(path.join(providerDir, filename))
        
            if (mount) router.use(`/providers/${id}`, mount)
        } catch (e) {
            continue
        }
    }

    return router
}
