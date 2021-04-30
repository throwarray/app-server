import sessionMiddleware from './session'
import passport from 'passport'
import Auth0Strategy from 'passport-auth0'
import createRouter from './createRouter'

// import flash from 'connect-flash'
// import bcrypt from 'bcryptjs'
// import { Strategy as LocalStrategy } from 'passport-local'
// import { ObjectId } from 'mongodb'

function compatMiddleware (req, res, next) {
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
    function (accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        //User.findOneAndUpdate({ user_id: profile.user_id }, profile, { upsert: true  }, function () {
        done(null, profile)
        // })
    })
)

const router = createRouter()


router.use(
    compatMiddleware, 
    sessionMiddleware, 
    // flash(), 
    passport.initialize(), 
    passport.session()
)

export default router





// passport.serializeUser((user, done) => {
//     done(null, user._id.toString())
// })    
// // passport#160
// passport.deserializeUser((req, id, done) => {
//     req.db
//     .collection('users')
//     .findOne(ObjectId(id))
//     .then(user => done(null, user))
// })
// passport.use(
//   new LocalStrategy(
//     { 
//         usernameField: 'email',     
//         passReqToCallback: true 
//     },
//     async (req, email, password, done) => {
//         const user = await req.db.collection('users').findOne({ email })    

//         if (user && (await bcrypt.compare(password, user.password))) 
//             done(null, user)

//         else done(null, false, { 
//           message: 'Email or password is incorrect'     
//         })
//     }
//   )
// )