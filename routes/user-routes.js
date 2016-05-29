 const express = require('express');
 const jsonParser = require('body-parser').json();
 const mongoose = require('mongoose');
 const authCheck = require(__dirname + '/../lib/check-token');
 const dbError = require(__dirname + '/../lib/db-error');
 const dbNoData = require(__dirname + '/../lib/db-no-data');
 const removeItem = require(__dirname + '/../lib/remove-item');

 const Product = require(__dirname + '/../models/product');
 const User = require(__dirname + '/../models/product');
 const Shipping = require(__dirname + '/../models/shipping').model;

 var userRouter = module.exports = exports = express.Router();

 // ====== User Edit ======

 userRouter.post('/address/new', authCheck, jsonParser, (req, res) => {
   // Check for info and user
   if (req.body && req.user) {
     // Create new address doc
     var newShipping = new Shipping(req.body);
     // Add new address info
     newShipping.fullName = req.body.fullName;
     newShipping.street = req.body.street;
     newShipping.country = req.body.country;
     newShipping.suite = req.body.suite;
     newShipping.city = req.body.city;
     newShipping.state = req.body.state;
     newShipping.zip = req.body.zip;
     newShipping.phone = req.body.phone;
     newShipping.owner_id = req.user._id;
     // Save new address
     newShipping.save((err, data) => {
       // Check erro
       if (err) {
         return res.status(500).json({
           msg: 'Required field missing.'
         });
       }
       // Add shipping to user shipping array
       req.user.shipping.push(data);
       // Return new Address
       res.status(200).json(data);
     });
   } else {
     return res.status(500).json({
       msg: 'No address info sent.'
     });
   }
 });

// Delete Shipping Document
 userRouter.delete('/address/:id', authCheck, jsonParser, (req, res) => {
   Shipping.remove({
     _id: req.params.id
   }, (err, deleted) => {
     if (err) {
       return res.status(500).json({
         msg: 'Could not remove address.'
       });
     }
     res.status(200).json({
       data: deleted
     });
   });
 });

 // ====== Get User ======

 // Get user info
 userRouter.get('/', authCheck, (req, res) => {
   if (!req.user) {
     return res.status(200).json({
       msg: 'User not found.'
     });
   }

   // Add shipping items to user doc
   Shipping.find({
     owner_id: req.user._id
   }, (err, data) => {
     if (err) return handleDbError(err, res);
     // Add shipping to doc
     req.user.shipping = data;
     // Return user info
     res.status(200).json({
       user: req.user
     });
   });
 });



 // ====== User Cart ====== 

 // Adds an item to a users cart
 userRouter.post('/cart/add', authCheck, jsonParser, (req, res) => {
   // Track how queries have finished
   var howMany = 0;
   // Respond to add product
   function addCartRes() {
     req.user.update({
       cart: req.body
     }, (err, data) => {
       if (err) return dbError(err, res);
       if (!data) return dbNoData(err, data);
       res.status(200).json({
         msg: 'Added to cart',
         data: data
       });
     });
   };

   // Iterates through the cart and add the products that are not populated
   req.body.forEach(function(currentItem, itemIndex) {
     if (!currentItem.hasOwnProperty('product')) {
       howMany++;
       newItem = true;
       console.log(currentItem.product_id);
       Product.findOne({
         _id: currentItem.product_id
       }, {}, function(err, data) {
         howMany--;
         req.body[itemIndex].product = data;
         if (howMany === 0) {
           addCartRes();
         }
       });
     } else if (howMany === 0 && itemIndex === req.body.length - 1) {
       addCartRes();
     }
   });
 });

 // Delete all items in users cart
 userRouter.delete('/cart/delete', authCheck, (req, res) => {
   req.user.update({
     cart: []
   }, (err, data) => {
     if (err) return handleDbError(err, res);
     if (!data) return handleNoData(data, res);

     res.status(200).json({
       msg: 'Cart Cleared',
       cart: data
     });
   })
 });

 // Gets all products in a user cart
 userRouter.get('/cart', authCheck, (req, res) => {
   try {

     res.status(200).json({
       msg: 'Cart retrieved',
       cart: req.user.cart
     });
   } catch (e) {
     console.log(e);
   }
 });