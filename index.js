const dotenv = require('dotenv')
const express = require('express')
const next = require('next')
const compression = require('compression')
const logger = require('morgan')

const { promisify } = require('util')
const { readFile } = require('fs')
const { createServer: createHttpsServer } = require('https')
const { createServer: createHttpServer } = require('http')

dotenv.config({})

const {
    USE_HTTPS_SERVER, NODE_ENV,  
    APP_URL = 'http://localhost:3000'
} = process.env

const PORT = Number(process.env.PORT || 3000)

const usesHttps = APP_URL.startsWith('https://')
const protocol = usesHttps? 'https://' : 'http://'
const dev = NODE_ENV !== 'production'
const isLocalHost = APP_URL.match(/https?:\/\/localhost:\d+$/)

const app = next({ dev })
const handle = app.getRequestHandler()
const expressApp = express()

const createServer = USE_HTTPS_SERVER || (isLocalHost && usesHttps)? 
    createHttpsServer:
    createHttpServer

;(async function () {
  await app.prepare()
  
  const readFileAsync = promisify(readFile)
  
  const httpsSettings = createServer === createHttpsServer? {
    key: await readFileAsync('./key.pem'),
    cert: await readFileAsync('./cert.pem')
  } : {}

  if (!dev) expressApp.set('trust proxy', 1) // trust first proxy
  if (dev) expressApp.use(logger('dev'))
  if (!dev) expressApp.use(compression())
  
  expressApp.use(express.static('./public'))
  expressApp.use((req, res) => handle(req, res))
  
  const server = createServer(httpsSettings, expressApp)
  
  await new Promise(function (resolve, reject) {
    server.listen(PORT, function (err) {
      if (err) reject(err)
      
      else resolve(PORT)
    })
  })
  
  console.log(`> Server ready on ${protocol}localhost:${PORT}`)
})().catch(err => {
  throw err
})
