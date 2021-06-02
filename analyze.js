// Serve the client.html and server.html output from webpack-bundle-analyzer
const express = require('express')

const app = express()

app.get('/', function (_req, res) { res.redirect('./client.html') })

app.use(express.static('.next/analyze'))

app.listen(process.env.PORT || 3000)