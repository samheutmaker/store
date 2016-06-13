 const express = require('express');
 const jsonParser = require('body-parser').json();
 const mongoose = require('mongoose');
 const flat = require('flat');
 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const a = require(__dirname + '/../lib/analytics');

 const User = require(__dirname + '/../models/user');
 const Cart = require(__dirname + '/../models/cart');


 const userRouter = module.exports = exports = express.Router();

 userRouter.get('/', authCheck, (req, res) => {
 	try {
 		return (req.user) ? res.status(200).json(req.user) : errors.dbError(res, err, 'Error retrieving user info.', 2);
 	} catch (e) {
 		return error.stdError(res, null, 1);
 	}
 });

 userRouter.put('/update', authCheck, jsonParser, (req, res) => {
	try {
 		if (req.user) {
 			if((req.body.authentication && req.body.authentication.password) || req.body['authentication.email']) {
 				return error.requiredPropError(res, 'Cannot change password');
 			}
 			User.update({_id: req.user._id}, flat(req.body),
 			 (err, data) => {
 				return (err) ? error.dbError(res, err, 'Error updating user info') : res.status(200).json(data);
 			});

 		} else {
 			return error.requiredPropError(res, 'User Token');
 		}
 	} catch (e) {
 		return error.stdError(res, null, 1);
 	}
 });