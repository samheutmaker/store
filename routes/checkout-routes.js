 const express = require('express');
 const jsonParser = require('body-parser').json();
 const mongoose = require('mongoose');
 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');
 const stripe = require('stripe')('sk_test_cMSm7uHKKH0u2sIckUugISga');

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

 		if (util.hasRequiredProps(req.body, requiredProps)) {
 			var amount = req.body.amount;

 			var stripeOptions = {
 				currency: 'usd',
 				customer: req.user.stripe_id,
 				amount: amount,
 				description: 'Charge for ' + req.user.authentication.email
 			};

 			stripe.charges.create(stripeOptions, (err, charge) => {
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