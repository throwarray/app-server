import passportMiddleware from './_middleware/passport'

import passport from 'passport'

import createRouter from './_middleware/createRouter'

const router = createRouter()

router.use(
    passportMiddleware, 
    function (req, res, next) {
        const returnTo = req.query && req.query.returnTo || '/'

        // Already authenticated
        if (req.isAuthenticated()) {
            res.redirect(new URL(returnTo || '/', process.env.APP_URL).toString())
            return
        }

        // Save the returnTo URL
        req.session.returnTo = returnTo
        
        // Save the session manually because serverless doesn't support fire and forget.
        // Likely redundant because of the passport.authenticate
        req.session.save(function (_error) {
            // Authenticate
            passport.authenticate('auth0', { scope: 'openid email profile' })(req, res, next)
        })
        
    }
)

export default router