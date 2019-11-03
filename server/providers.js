const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const bodyParser = require('body-parser')

const path = require('path')

const { getProvidersFromDirectory } = require('./providers/lib.js')
 
const wrapProvider = require('./providers/wrap-provider')

const withFormBody = bodyParser.urlencoded({ extended: false })

const providerId = required => { 
    return {
        type: String,
        required: !!required,
        maxLength: 16, 
        minLength: 1,
        validate: {
            validator: v => /^\w+\b$/.test(v),
            message: props => `${props.value} is not a valid provider id!`
        },
    }
}

function providerIdCap(val) {
    return Array.isArray(val) && val.length <= 25
}

const arrayOfProviderId =()=> { 
    return {
        type: [providerId()],
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

    if (!body || !body.id || !req.isAuthenticated()) {
        done(true)
        return
    }

    Provider.remove({
        user: req.user.user_id,
        id: body.id
    }, done)
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

        if (!body || !body.id || !userId || !req.isAuthenticated()) {
            done(new Error('Failed to handle request.'))
            return
        }

        if (typeof body.streams === 'string') body.streams = body.streams.split(',')
        if (typeof body.collections === 'string') body.collections = body.collections.split(',')
        if (typeof body.meta === 'string') body.meta = body.meta.split(',')

        // Add or modify existing provider
        Provider.count({ user: userId }, function (err, count) {
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
