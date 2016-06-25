 const express = require('express');
 const jsonParser = require('body-parser').json();
 
 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');
 const Order = require(__dirname + '/../models/order.js');
 const stripe = require(__dirname + '/../lib/stripe');
 

 const checkoutRouter = module.exports = exports = express.Router();


 checkoutRouter.get('/user', authCheck, (req, res) => {
 	try {

 		if (req.user && req.user.stripe_id) {

 			stripe.customers.retrieve(req.user.stripe_id, (err, customer) => {
 				return (err || !customer) ? error.dbError(res, err, 'Error retreiving user info s.') : success();

 				function success() {
 					a.track({
 						userId: req.user._id.toString(),
 						event: 'ADDED_NEW_CARD',
 					});
 					console.log(customer);

 					return res.status(200).json(customer);

 				}

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
 		var requiredProps = ['amount'];

 		if (util.hasRequiredProps(req.body, requiredProps) && req.body.amount < 500) {
 			var amount = req.body.amount;

 			var stripeOptions = {
 				currency: 'usd',
 				customer: req.user.stripe_id,
 				amount: amount * 100,
 				description: 'Charge for ' + req.user.authentication.email
 			};

 			stripe.charges.create(stripeOptions, (err, charge) => {
 				if (err) {
 					res.send(500, err);
 				} else {
 					var newOrder = new Order();

 					newOrder.owner_id = req.user._id;
 					newOrder.amount = req.body.amount;
 					newOrder.cart = req.body.cart;
 					newOrder.address = req.body.address;
 					newOrder.fullfiled = false;
 					newOrder.dateCreated = new Date();

 					newOrder.save((err, savedOrder) => {
 						console.log(newOrder);
 						return (err || !savedOrder) ? error.dbError(res, err, 'Error placing order.') : success();

 						function success() {
 							savedOrder.placeNewOrder()
 							.then(() => {
 								res.status(200).json(savedOrder);
 							})
 							.catch(() => {
 								return error.stdError(res, null, 3);
 							})
 						}

 					})
 					res.send(204);
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


 checkoutRouter.post('/card/new', authCheck, jsonParser, (req, res) => {
 	try {
 		var requiredProps = ['stripeToken'];

 		if (util.hasRequiredProps(req.body, requiredProps)) {

 			stripe.customers.createSource(req.user.stripe_id, {
 				source: req.body.stripeToken
 			}, (err, card) => {
 				console.log(card);
 				console.log(err);
 				if (err) {
 					res.send(500, err);
 				} else {
 					res.send(204);
 				}
 			});

 		} else {
 			return errors.requiredPropError(res);
 		}
 	} catch (e) {
 		return error.stdError(res, null, 1);
 	}
 });