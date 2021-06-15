import passportMiddleware from '../_middleware/passport'
import createRouter from '../_middleware/createRouter'

const router = createRouter()

router.get(
    passportMiddleware,    
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.status(401)
            res.json({ error: true })
        }

        else next()
    },
    async function (req, res) {
        const { /*_raw,*/ _json, user_id } = req.user

        let providers; try { 
            providers = await req.db.collection('providers').find({ 
                user: String(user_id)
            }).toArray()
        } finally {
            res.json({
                ..._json,
                user_id: String(user_id),
                providers: providers || [],
            })
        }
    }
)

export default router