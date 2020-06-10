import passportMiddleware from './_middleware/passport'

import nextConnect from 'next-connect'

const router = nextConnect()

router.use(
    passportMiddleware,    
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({
                message: 'Unauthorized',
                error: true
            })
        }

        else next()
    },
    async function (req, res) {
        const { _raw, _json, user_id } = req.user

        let providers; try { 
            providers = await req.db.collection('providers').find({ 
                user: user_id 
            }).toArray()
        } finally {
            res.json({
                ..._json,
                user_id,
                providers: providers || []
            })
        }
    }
)

export default (req, res)=> router.apply(req, res) 