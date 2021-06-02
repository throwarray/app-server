import sessionMiddleware from './session'
import passport from 'passport'
import Auth0Strategy from 'passport-auth0'
import createRouter from './createRouter'

function compatMiddleware (_req, res, next) {
    res.redirect = (code, path) => {
        let location = path
        let status = code

        if (typeof code === 'string') {
            status = 302
            location = code
        }

        res.statusCode = status
        res.setHeader('location', location)
        res.end()
    }

    next()
}

passport.serializeUser(function (user, done) {  done(null, user)  })

passport.deserializeUser(function (user, done) { done(null, user)  })

// Configure Passport to use Auth0
passport.use(
    new Auth0Strategy({
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.REDIRECT_URI
    },
    function (_accessToken, _refreshToken, _extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        //User.findOneAndUpdate({ user_id: profile.user_id }, profile, { upsert: true  }, function () {})

        done(null, profile)
    })
)

const router = createRouter()

router.use(
    compatMiddleware, 
    sessionMiddleware, 
    passport.initialize(), 
    passport.session()
)

export default router

// export function ensureAuth (req, res, next) {
//     if (req.user) return next()
//     if (req.session) req.session.returnTo = req.originalUrl
//     res.redirect('/api/login')
// }