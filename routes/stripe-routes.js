 const express = require('express');
 const jsonParser = require('body-parser').json();

 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');
 const Order = require(__dirname + '/../models/order.js');
 const stripe = require(__dirname + '/../lib/stripe');


 const stripeRouter = module.exports = exports = express.Router();


 stripeRouter.get('/user', authCheck, (req, res) => {
 	try {

 		if (req.user && req.user.stripe_id) {

 			stripe.customers.retrieve(req.user.stripe_id, (err, customer) => {
 				return (err || !customer) ? error.dbError(res, err, 'Error retreiving user info s.') : success();

 				function success() {
 					a.track({
 						userId: req.user._id.toString(),
 						event: 'ADDED_NEW_CARD',
 					});

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


 stripeRouter.post('/card/new', authCheck, jsonParser, (req, res) => {
 	try {
 		var requiredProps = ['stripeToken'];

 		if (util.hasRequiredProps(req.body, requiredProps)) {
 			stripe.customers.createSource(req.user.stripe_id, {
 				source: req.body.stripeToken
 			}, (err, card) => {
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


 stripeRouter.post('/card/delete', authCheck, jsonParser, (req, res) => {
 	try {
 		var requiredProps = ['cardToken'];

 		if (util.hasRequiredProps(req.body, requiredProps)) {
 			stripe.customers.deleteCard(
 				req.user.stripe_id,
 				req.body.cardToken, 
 				(err, card) => {
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