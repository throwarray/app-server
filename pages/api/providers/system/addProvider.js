import connectNext from 'next-connect'

import passport from '../../_middleware/passport'

import mongoose from 'mongoose'

const router = connectNext()

router.use(passport)

router.post(
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({
                message: 'Unauthorized',
                error: true
            })
        } else next()
    },   
    function (req, res) {
        const userId = req.user && req.user.user_id
        const body = req.body
        const providerCap = 25
        const Provider = mongoose.model('providers')
        
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
            if (err) done(new Error('Failed to handle request.'))
    
            else if (count >= providerCap) done(new Error('Provider limit reached.'))
            
            else  new Provider({ ...body, user: userId  }).validate(function (err) {
                if (!err) Provider.updateOne(
                    { user: '' + userId, id: body.id }, 
                    { ...body, user: '' + userId },
                    { upsert: true }, 
                    done
                )
                else done(err)
            })
        })
    }    
)

export default (req, res)=> router.apply(req, res)