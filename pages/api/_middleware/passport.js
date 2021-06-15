import sessionMiddleware from './session'
import passport from 'passport'
import Auth0Strategy from 'passport-auth0'

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

const passportMiddleware = passport.initialize()

const passportSessionMiddleware = passport.session()

// next-connect doesn't seem to support nested routers correctly
// IDEA https://github.com/blakeembrey/compose-middleware

export default function router (req, res, next) {
    compatMiddleware(req, res, function (err) {
        if (err) next(err)
        else sessionMiddleware(req, res, function (err) {
            if (err) next(err)
            else passportMiddleware(req, res, function (err) {
                if (err) next(err)
                else passportSessionMiddleware(req, res, next)
            })
        })
    })
}
