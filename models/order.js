const mongoose = require('mongoose');
const shippingSchema = require(__dirname + '/shipping.js').schema;
const Cart = require(__dirname + '/cart.js');
const stripe = require(__dirname + '/../lib/stripe');
const a = require(__dirname + "/../lib/analytics");


// User Model
var orderSchema = mongoose.Schema({
  owner_id: String,
  stripe_order_id: String,
  stripe_charge_id: String,
  amount: Number,
  cart: Object,
  address: shippingSchema,
  dateCreated: Date,
  fullfilled: Boolean
});


// Initialize User
orderSchema.methods.placeNewOrder = function(orderDetails, user) {
  return new Promise((resolve, reject) => {
    if (orderDetails && orderDetails.id && user.stripe_id) {
      stripe.orders.pay(orderDetails.id, {
        customer: user.stripe_id
      }, (err, order) => {
        if (err || !order) {
            reject(err);
        }
        
        this.stripe_charge_id = order.charge;

        this.save((err2, savedOrder) => {
          if (err2 || !order) {
            reject(err);
          }

          a.track({
            userId: this.owner_id.toString(),
            event: 'PLACED_ORDER',
            properties: {
              order: this
            }
          });

          resolve(order);
        });
      });
    } else {
      reject('Missing Params');
    }

  });
};

// Export user model
module.exports = exports = mongoose.model('Order', orderSchema);