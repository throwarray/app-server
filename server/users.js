const express = require('express')

const mongoose = require('mongoose')

const router = express.Router()

function noop() {}

router.get('/user', function (req, res /*, next */) {
  function redirectToLogin () {
    req.session.returnTo = req.originalUrl

    res.redirect('/login')
  }

  if (!req.user || !req.isAuthenticated()) {
    res.format({
      // ajax request
      json: ()=> {
        res.status(401)
        res.json({})
      },
      // html
      html: redirectToLogin,
      default: redirectToLogin
    })
  } else {
    const { _raw, _json, ...userProfile } = req.user

    noop(_raw,_json) // linter

    mongoose.model('providers').find({
      user: req.user.user_id
    }, function (err, providers) {
      res.json({
        ...userProfile,
        providers: providers || []
      })
    })
  }
})




const collectionSchema = new mongoose.Schema({}, { strict: false })
const itemsSchema = new mongoose.Schema({}, { strict: false })

const Collection = mongoose.model('collections', collectionSchema)

const CollectionItem = mongoose.model('items', itemsSchema)


function apiRouteWithAuth (req, res, next) {
  if (!req.user || !req.isAuthenticated()) {
    res.status(401)
    res.json({})

    return
  }

  next()
}

function createCollection ({ user_id, id }, cb) {
  const data = { 
    user_id: String(user_id), 
    id: String(id),
    type: 'collection'
  }

  return Collection.update(data, { $setOnInsert: data }, { upsert: true }, function (err /*, doc*/) {
    cb(err, data)
  })
}

function addItem ({ user_id, ref, id, type }, cb) {
  const item = new CollectionItem({
    user_id: String(user_id),
    ref: String(ref),
    id: String(id),
    type: String(type)
  })

  return item.save(function (err) {
    cb(err, item)
  })
}

// Routes


router.get('/collection', apiRouteWithAuth, function (req, res) {
  const query = req.query

  const db_query = {
    user_id: String(req.user.user_id),
    id: String(query.id)    
  }

  if (query.id !== void 0) db_query.id = String(query.id)
  
  CollectionItem.find(db_query, function (err, docs) {
    if (err) {
      res.status(500)
      res.json({})
      return
    }

    res.json(docs)
  })
})

router.post('/collection/new', apiRouteWithAuth, function (req, res) {
  createCollection({ 
    user_id: req.user.user_id, 
    id: req.query.id 
  }, function (err, data) {
    if (err) {
      console.log('WHATS ERR', err)
      res.status(500)
      res.json({})
    } else res.json(data)
  })
})

router.post('/collection/add', apiRouteWithAuth, function (req, res) {
  addItem({
    user_id: req.user.user_id,
    ref: req.query.ref,
    id: req.query.id,
    type: 'item'
  }, function (err, data) {
    if (err) {
      res.status(500)
      res.json({})
    } else res.json(data)
  })
})



module.exports = router
