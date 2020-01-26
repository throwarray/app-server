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

module.exports = router
