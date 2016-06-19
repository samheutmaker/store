 const express = require('express');
 const flat = require('flat');
 const jsonParser = require('body-parser').json();
 const authCheck = require(__dirname + '/../lib/check-token');
 const errors = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');

 const Shipping = require(__dirname + '/../models/shipping').model;

 var shippingRouter = module.exports = exports = express.Router();

 // ====== Shipping CRUD ======

 // Create Shipping Document
 shippingRouter.post('/address/new', authCheck, jsonParser, (req, res) => {
   try {
     const requiredProps = ['fullName', 'street', 'country', 'city', 'state', 'zip', 'phone'];

     if (req.body && util.hasRequiredProps(req.body, requiredProps) && req.user) {
       var newShipping = new Shipping(req.body);
       newShipping.fullName = req.body.fullName;
       newShipping.street = req.body.street;
       newShipping.country = req.body.country;
       newShipping.suite = req.body.suite;
       newShipping.city = req.body.city;
       newShipping.state = req.body.state;
       newShipping.zip = req.body.zip;
       newShipping.phone = req.body.phone;
       newShipping.owner_id = req.user._id;

       newShipping.save((err, data) => {
         return ((err) ? error(err) : success(data));
       });
       // Create New Success
       function success(data) {
         a.track({
           userId: req.user._id.toString(),
           event: 'ADDED_SHIPPING_ADDRESS',
           properties: {}
         });
         return res.status(200).json(data);
       };
       // Create New Error
       function error(err) {
         return errors.dbError(res, err, 'Error saving address.', 2);
       };

     } else {
       return errors.requiredPropError(res);
     }
   } catch (e) {
     return errors.stdError(res, null, 1);
   }
 });

 // Get All shipping documents
 shippingRouter.get('/address/all', authCheck, jsonParser, (req, res) => {
   try {
     if (req.user && req.user._id) {
       Shipping.find({
         owner_id: req.user._id
       }, (err, data) => {
         return ((err) ? error(err) : success(data));
       });
       // Get All Success
       function success(data) {
         return res.status(200).json(data);
       };
       // Get All Error
       function errorr(err) {
         return error.dbError(res, err, 'Error retrieving addresses', 2)
       };

     } else {
       return errors.requiredPropError(res, 'User Id');
     }
   } catch (e) {
     return errors.stdError(res, null, 1);
   }
 });

 // Get Shipping Document
 shippingRouter.get('/address/:id', authCheck, jsonParser, (req, res) => {
   try {
     if (req.params && req.params.id && req.user) {
       Shipping.findOne({
         _id: req.params.id,
         owner_id: req.user._id
       }, (err, data) => {
         return ((err || !data) ? error(err) : success(data));
       });
       // Get Success
       function success(data) {
         return res.status(200).json(data);
       }
       // Get Error
       function error(err) {
         return errors.dbError(res, err, 'Error retrieving address.', 2)
       };

     } else {
       return errors.requiredPropError(res, 'Address Id');
     }
   } catch (e) {
     return errors.stdError(res, null, 1);
   }
 });

 // Update shipping document
 shippingRouter.put('/address/update', authCheck, jsonParser, (req, res) => {
  try {
    if (req.user) {
      var _id = req.body._id;
      delete req.body._id;
     
      Shipping.update({
        _id: _id,
        owner_id: req.user._id
      }, flat(req.body), (err, data) => {
        return (err) ? error.dbError(res, err, 'Error updating address info') : success();

        function success() {
          a.track({
            userId: req.user._id.toString(),
            event: 'UPDATED_SHIPPING_ADDRESS',
            properties: {
              changedItems: Object.keys(req.body)
            }
          });
          return res.status(200).json(data)
        }

      });

    } else {
      return error.requiredPropError(res, 'User Token');
    }
  } catch (e) {
    return error.stdError(res, null, 1);
  }
 });

 // Delete Shipping Document
 shippingRouter.post('/address/remove/:id', authCheck, jsonParser, (req, res) => {
   try {
     if (req.params && req.params.id && req.user) {
       Shipping.remove({
         _id: req.params.id,
         owner_id: req.user._id
       }, (err, data) => {
         return ((err || !data) ? error(err) : success(data));
       });
       // Delete Success
       function success(data) {
         a.track({
           userId: req.user._id.toString(),
           event: 'REMOVED_SHIPPING_ADDRESS',
           properties: {}
         });
         return res.status(200).json(data);
       }
       // Delete Error
       function error(err) {
         return errors.dbError(res, err, 'Error deleting address.', 2)
       };

     } else {
       return errors.requiredPropError(res);
     }
   } catch (e) {
     return errors.stdError(res, null, 1);
   }
 });