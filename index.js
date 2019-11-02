const dotenv = require('dotenv')
const express = require('express')
const next = require('next')
const compression = require('compression')
const mongoose = require('mongoose')

const logger = require('morgan')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const SessionStore = require('connect-mongo')(session)

const { EventEmitter } = require('events')
const { promisify } = require('util')
const { readFile } = require('fs')
const { join: joinPath } = require('path')
const { createServer: createHttpsServer } = require('https')
const { createServer: createHttpServer } = require('http')
const { combineURLS } = require('./components/fetch')

mongoose.set('useCreateIndex', true)
dotenv.config({})

const { USE_HTTPS_SERVER, PORT:strPORT = 3000, DB_URL, NODE_ENV,  APP_URL = 'http://localhost:3000'  }  = process.env
const PORT = Number(strPORT)
const usesHttps = APP_URL.startsWith('https://')
const protocol = usesHttps? 'https://' : 'http://'
const dev = NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const expressApp = express()
const isLocalHost = APP_URL.match(/https?:\/\/localhost:\d+$/)

const createServer = USE_HTTPS_SERVER || (isLocalHost && usesHttps) ? 
  createHttpsServer:
  createHttpServer

function connect_db (uri, opts) {
  const _defaults = { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true }

  return new Promise(function (resolve, reject) {
    mongoose.connect(uri, { ..._defaults, ...opts }, function (err) {
      if (err) reject(err)
      else resolve()
    })  
  })
}

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || combineURLS(APP_URL, '/callback')
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user

    //User.findOneAndUpdate({ user_id: profile.user_id }, profile, { upsert: true  }, function () {
    done(null, profile)
    // })
  }
)

passport.use(strategy)
passport.serializeUser(function (user, done) {  done(null, user)  })
passport.deserializeUser(function (user, done) { done(null, user)  })


;(async function () {
  await connect_db(DB_URL)
  
  await app.prepare()
  
  const readFileAsync = promisify(readFile)
  
  const httpsSettings = createServer === createHttpsServer? {
    key: await readFileAsync('./key.pem'),
    cert: await readFileAsync('./cert.pem')
  } : {}

  // config express-session
  const sess = {
    resave: false,
    saveUninitialized: false,
    key: 'session',
    cookieName: 'session',
    secret: process.env.SESSION_SECRET || 'CHANGE THIS SECRET',
    store: new SessionStore({ mongooseConnection: mongoose.connection }),
    cookie: {}
  }
  
  if (usesHttps) sess.cookie.secure = true
  
  const cfg = {
    events: new EventEmitter(), 
    nextApp: app, 
    expressApp,
    httpsSettings,
    port: PORT,
    session: sess,
    env: { ...process.env },
    dev
  }

  if (!dev) expressApp.set('trust proxy', 1) // trust first proxy
  if (dev) expressApp.use(logger('dev'))

  expressApp.use(cookieParser())
  expressApp.use(session(sess))
  expressApp.use(passport.initialize())
  expressApp.use(passport.session())
  expressApp.use(flash())
  
  if (!dev) expressApp.use(compression())
  
  expressApp.use(function (req, res, next) {  
    res.setHeader('Access-Control-Allow-Origin', '*')
    next() 
  })

  expressApp.get('/service-worker.js', function (req, res) {
    app.serveStatic(req, res, joinPath(__dirname, '.next', '/service-worker.js'))
  })

  expressApp.use(express.static('./public'))
  expressApp.use(require('./server/auth.js'))
  expressApp.use(require('./server/users.js'))
  expressApp.use(await (require('./server/providers.js')(cfg)))
  expressApp.use((req, res) => handle(req, res))

  const server = createServer(httpsSettings, expressApp)

  await new Promise(function (resolve, reject) {
    server.listen(PORT, function (err) {
      if (err) reject(err)
      else resolve(PORT)
    })
  })

  console.log(`> Server ready on ${protocol}localhost:${PORT}`)

  cfg.events.emit('ready')
  
})().catch(err => {
  throw err
})