 const express = require('express');
 const jsonParser = require('body-parser').json();

 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');
 const Order = require(__dirname + '/../models/order.js');
 const stripe = require(__dirname + '/../lib/stripe');


 const checkoutRouter = module.exports = exports = express.Router();

 checkoutRouter.post('/validate', authCheck, jsonParser, (req, res) => {
 	try {

 		var requiredProps = ['cart', 'address'];

 		if (util.hasRequiredProps(req.body, requiredProps) && req.user) {

 			var orderItems = req.body.cart.map((item, itemIndex) => {
 				return {
 					type: 'sku',
 					parent: item.item.stripe_SKUs[item.size],
 					quantity: item.quantity
 				};
 			});

 			var shipping = {
 				name: req.body.address.fullName,
 				address: {
 					line1: req.body.address.street,
 					line2: req.body.address.suite,
 					city: req.body.address.city,
 					state: req.body.address.state,
 					postal_code: req.body.address.zip,
 					country: req.body.address.country

 				}
 			};

 			var orderOptions = {
 				currency: 'usd',
 				items: orderItems,
 				customer: req.user.stripe_id,
 				shipping: shipping
 			};

 			stripe.orders.create(orderOptions, (err, order) => {
 				return (err || !order) ? error.dbError(res, err, 'Error validating order') : success();

 				function success() {
 				
 					a.track({
 						userId: req.user._id.toString(),
 						event: 'VALIDATED_ORDER'
 					});

 					return res.status(200).json(order);
 				};

 			});

 		} else {
 			return errors.requiredPropError(res);
 		}
 	} catch (e) {
 		return error.stdError(res, null, 1);
 	}
 });


 checkoutRouter.post('/charge', authCheck, jsonParser, (req, res) => {
 	try {
 		var requiredProps = ['order', 'cart', 'address'];

 		if (util.hasRequiredProps(req.body, requiredProps)) {

 			var newOrder = new Order();

 			newOrder.owner_id = req.user._id;
 			newOrder.cart = req.body.cart;
 			newOrder.address = req.body.address;
 			newOrder.stripe_order_id = req.body.order.id;
 			newOrder.amount = req.body.order.amount;
 			newOrder.fullfiled = false;
 			newOrder.dateCreated = new Date();

 			newOrder.save((err, savedOrder) => {
 				return (err || !savedOrder) ? error.dbError(res, err, 'Error placing order.') : success();

 				function success() {
 					savedOrder.placeNewOrder(req.body.order, req.user)
 						.then(() => {
 							res.status(200).json(savedOrder);
 						})
 						.catch(() => {
 							return error.stdError(res, null, 3);
 						});
 				}

 			});
 		} else {
 			return errors.requiredPropError(res);
 		}
 	} catch (e) {
 		console.log(e);
 		return error.stdError(res, null, 1);
 	}
 });