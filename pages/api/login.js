import passportMiddleware from './_middleware/passport'

import passport from 'passport'

import nextConnect from 'next-connect'

const router = nextConnect()

router.use(
    passportMiddleware, 
    function (req, res, next) {
        if (req.isAuthenticated()) res.redirect('/')
        else next()
    },
    function (req, res, next) {
        passport.authenticate('auth0', {
            scope: 'openid email profile',
            failureRedirect: '/api/login',
            successRedirect: '/'
        })(req, res, next)
    }
)

export default (req, res)=> router.apply(req, res) 