import passportMiddleware from './_middleware/passport'

import passport from 'passport'

import createRouter from './_middleware/createRouter'

import { URL } from 'url'

const router = createRouter()

router.use(
    function allowResponse (_req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        next()
    },
    passportMiddleware, 
    function verifyResponse (req, res, next) {
        if (req.isAuthenticated()) return next()

        passport.authenticate('auth0', function (err, user, _info) {
            if (err) return next(err)

            if (!user) return res.redirect('/api/login')
            
            req.logIn(user, function (err) {
                if (err) return next(err)
                next()
            })
        })(req, res, next)
    },
    function followRedirect (req, res) {
        const returnTo = req.session.returnTo

        function endRequest (_error) { res.redirect(new URL(returnTo || '/', process.env.APP_URL).toString()) }

        // Save the session manually because serverless doesn't support fire and forget
        if (returnTo) {
            delete req.session.returnTo
            req.session.save(endRequest) 
        } else endRequest()
    }
)

export default router