const mongoose = require('mongoose');
const shippingSchema = require(__dirname + '/shipping.js').schema;
const Cart = require(__dirname + '/cart.js');
const a = require(__dirname + "/../lib/analytics");


// User Model
var orderSchema = mongoose.Schema({
  owner_id: String,
  amount: Number,
  cart: Object,
  address: shippingSchema,
  dateCreated: Date,
  fullfilled: Boolean
});


// Initialize User
orderSchema.methods.placeNewOrder = function(orderData) {
  return new Promise((resolve, reject) => {
    a.track({
      userId: this.owner_id.toString(),
      event: 'PLACED_ORDER',
      properties: {
        order: this
      }
    });
    resolve();
  });
};

// Export user model
module.exports = exports = mongoose.model('Order', orderSchema);