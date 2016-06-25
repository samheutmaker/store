const express = require('express');
const stripe = require(__dirname + '/../lib/stripe');
const jsonParser = require('body-parser').json();
const basicHTTP = require(__dirname + '/../lib/basic-http');
const authCheck = require(__dirname + '/../lib/check-token');
const a = require(__dirname + "/../lib/analytics");

const User = require(__dirname + '/../models/user');

var authRouter = module.exports = exports = express.Router();

// Create new User
authRouter.post('/register', jsonParser, (req, res) => {

  console.log(req.body);
  // Check email and password length
  if (!((req.body.email || "").length && (req.body.password || "").length >
    7)) {
    return res.status(400).json({
      msg: 'Email or password not long enough'
    })
  }

  // Check if user is already in database
  User.findOne({
    'authentication.email': req.body.email
  }, (err, user) => {
    // Check for DB Error
    if (err) {
      return res.status(500).json({
        msg: 'DB Error'
      })
    }
    // Check if user is populated (exists)
    if (user) {
      return res.status(500).json({
        msg: 'User already Exists'
      })
    }

    var newUser = new User();
    newUser.authentication.email = req.body.email;
    newUser.hashPassword(req.body.password);
    newUser.name = req.body.name;
    newUser.gender = req.body.gender;
    newUser.DOB = req.body.DOB;
    newUser.createdAt = new Date();

    var stripeToken = req.body.token;

    stripe.customers.create({
      description: 'Store Inc',
      email: req.body.email,
      source: stripeToken
    })
    .then((customer) => {
        newUser.stripe_id = customer.id;
        newUser.save((err, user) => {
          newUser.initialize().then(() => {
            if (err || !user) {
              return res.status(500).json({
                msg: 'Error creating user'
              });
            }

            res.status(200).json({
              token: user.generateToken(),
              user: user
            })
          }, (err) => {
            console.log(err);
          });
        });

      })
    .catch((e) => {
      console.log(e);
    } ) 
  });
});

// User Login
authRouter.get('/login', basicHTTP, (req, res) => {
  // Check DB for user
  User.findOne({
    'authentication.email': req.basicHTTP.email
  }, (err, user) => {
    // Check for error
    if (err) {
      return res.status(401).json({
        msg: 'Error finding user'
      })
    }
    // Check for null user
    if (!user) {
      return res.status(401).json({
        msg: 'User does not exist'
      })
    }
    // Compare user password
    if (!user.comparePassword(req.basicHTTP.password)) {
      return res.status(401).json({
        msg: 'Invalid username or password'
      })
    }

    a.track({
      userId: user._id.toString(),
      event: 'USER_SIGNED_IN'
    });

    // Authenticate User, respond with token and user data
    res.status(200).json({
      user: user,
      token: user.generateToken()
    });

  })
})