import passportMiddleware from './_middleware/passport'

import passport from 'passport'

import createRouter from './_middleware/createRouter'

const router = createRouter()

router.use(
    function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        next()
    },
    
    passportMiddleware,

    function (req, res, next) {
        if (req.isAuthenticated()) res.redirect('/')

        else next()
    }, 
    
    function (req, res, next) {
        passport.authenticate('auth0', function (err, user, info) {
            if (err) return next(err)

            if (!user) return res.redirect('/api/login')
            
            req.logIn(user, function (err) {
              if (err) { return next(err) }
              
              const returnTo = req.session.returnTo
              
              if (returnTo) delete req.session.returnTo
              
              res.redirect(returnTo || '/')
            })
        })(req, res, next)
    }
)

//export default (req, res) => router.apply(req, res)
export default router