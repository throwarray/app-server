import connectNext from 'next-connect'

import passport from '../../_middleware/passport'

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
    
    async function (req, res) {
        const db = req.db
        const userId = req.user.user_id

        function handleError (err) {
            if (err && err.message === 'Unauthorized')
                res.json({ 
                    type: 'unauthorized', 
                    value: 'Unauthenticated', 
                    error: true 
                })
        
            else res.json({ 
                type: 'error', 
                value: 'Error', 
                error: true 
            })
        }
  
        if (!userId) return handleError(new Error('Unauthorized'))
        
        const bodyId = req.body && req.body.id
    
        if (typeof bodyId !== 'string') return handleError(new Error('Error'))

        try {
            await db.collection('providers').deleteOne({
                user: '' + userId,
                id: '' + bodyId
            })
        } catch (e) {
            return handleError(e)
        }

        res.json({ type: 'success', value: 'Success' })
})

export default (req, res) => router.apply(req, res)

