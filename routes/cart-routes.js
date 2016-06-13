 const express = require('express');
 const jsonParser = require('body-parser').json();
 const mongoose = require('mongoose');
 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const a = require(__dirname + '/../lib/analytics');

 const User = require(__dirname + '/../models/product');
 const Cart = require(__dirname + '/../models/cart');


 var cartRouter = module.exports = exports = express.Router();


 // ====== Shopping Cart CRUD ======

 // Get Entire Cart
 cartRouter.get('/', authCheck, (req, res) => {
   try {
     if (req.user) {
       Cart.findOne({
         owner_id: req.user._id
       }, (err, cart) => {
         return ((err || !cart) ? error(err) : success(cart));

         // Create New Success
         function success(data) {
          data.populate()
          .then((populatedCart) => {
            return res.status(200).json(populatedCart);
          }, (err) => {
            return errors.dbError(res, err, 'Error retrieving cart.', 2);
          });
         };
         
         // Create New Error
         function error(err) {
           return errors.dbError(res, err, 'Error retrieving cart.', 2);
         };
       });
     } else {
       return error.requiredPropError(res, 'User Id');
     }
   } catch (e) {
     return error.stdError(res, null, 1);
   }
 });


 // Add Item to Cart -- Returns Entire Cart
 cartRouter.post('/add', authCheck, jsonParser, (req, res) => {
   try {
     if (req.body && req.body.itemId && req.user) {
       Cart.findOne({
         owner_id: req.user._id
       }, (err, cart) => {
         if (!err && cart) {
           cart.addItem({
             itemId: req.body.itemId,
             quantity: req.body.quantity || 1,
             size: req.body.size || 'M'
           }).then((newItem) => {

             a.track({
               userId: req.user._id.toString(),
               event: 'added item to cart',
               properties: {
                itemId: req.body.itemId,
                quantity: req.body.quantity || 1,
                size: req.body.size || 'M'
               }
             });

             return res.status(200).json(newItem);
           }, (err) => {
             return error.dbError(res, err, 'Error adding item.', 2);
           })
         } else {
           return error.dbError(res, err, 'Error Retrieving Cart.', 2);
         }
       });
     } else {
       return error.requiredPropError(res, 'Item Id');
     }
   } catch (e) {
     return error.stdError(res, null, 1);
   }
 });


 // Remove item from Cart -- Returns Entire Cart
 cartRouter.delete('/remove', authCheck, jsonParser, (req, res) => {
   try {
     if (req.body && req.body.itemId && req.user) {
       Cart.findOne({
         owner_id: req.user._id
       }, (err, cart) => {
         if (!err && cart) {
           cart.removeItem({
             itemId: req.body.itemId,
             quantity: req.body.quantity || 1,
             size: req.body.size || 'L'
           }).then((newItem) => {
             a.track({
               userId: req.user._id.toString(),
               event: 'removed item from cart',
               properties: {
                itemId: req.body.itemId,
                quantity: req.body.quantity || 1,
                size: req.body.size || 'L'
               }
             });
             return res.status(200).json(newItem);
           }, (err) => {
            console.log(err);
             return error.dbError(res, err, 'Error removing item.', 2);
           })
         } else {
           return error.dbError(res, err, 'Error Retrieving Cart.', 2);
         }
       });
     } else {
       return error.requiredPropError(res, 'Item Id');
     }
   } catch (e) {
     return error.stdError(res, null, 1);
   }
 });
