const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const shippingSchema = require(__dirname + '/shipping.js').schema;
const Cart = require(__dirname + '/cart.js');
const a = require(__dirname + "/../lib/analytics");


// User Model
var userSchema = mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  birthday: Date,
  gender: String,
  geoTag: String,
  social: String,
  orders: Array,
  shipping: [shippingSchema],
  authentication: {
    email: String,
    password: String
  }
});

// Initialize User
userSchema.methods.initialize = function() {
  return new Promise((resolve, reject) => {

    var newCart = new Cart();
    console.log(this._id);
    newCart.owner_id = this._id;
    newCart.save((err, data) => {
      console.log(err);
      console.log(data);
      (err) ? reject(err) : resolve(data);
    })
  });
};


// Hash user password
userSchema.methods.hashPassword = function(password) {
  this.authentication.password = bcrypt.hashSync(password, 8);
};
// Compare hashed passwords
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.authentication.password);
};
// Generate Token based on user id and the app secret
userSchema.methods.generateToken = function() {
  return jwt.sign({
    id: this._id
  }, process.env.TOKEN_SECRET || 'CHANGE_ME');
};

// Export user model
module.exports = exports = mongoose.model('User', userSchema);