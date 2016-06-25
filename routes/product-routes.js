const express = require('express');
const jsonParser = require('body-parser').json();

const authCheck = require(__dirname + '/../lib/check-token');
const error = require(__dirname + '/../lib/errors');
const util = require(__dirname + '/../lib/utilities');
const a = require(__dirname + '/../lib/analytics');

const Product = require(__dirname + '/../models/product');


var productRouter = module.exports = exports = express.Router();

// Gets all Products
productRouter.get('/', jsonParser, (req, res) => {
  Product.find({}, (err, data) => {
    // Check for error retrieving
    // Check for empty array of results
    if (!data.length) {
      return res.status(200).json({
        msg: 'No items found',
        data: data
      })
    }
    //send results back
    res.status(200).json(data);
  });
});

// Get one product
productRouter.get('/:id', jsonParser, (req, res) => {
  Product.findOne({
    _id: req.params.id
  }, (err, data) => {


    //send results back
    res.status(200).json({
      msg: "Successful",
      data: data
    });
  });


});

productRouter.post('/new', authCheck, jsonParser, (req, res) => {
  try {
    var newProduct = new Product();

    newProduct.name = req.body.name;
    newProduct.SKU = req.body.SKU;
    newProduct.gender = req.body.gender;
    newProduct.desc = req.body.desc;
    newProduct.cost = req.body.cost;
    newProduct.season = req.body.season;
    newProduct.type = req.body.type;
    newProduct.sizes = req.body.sizes;
    newProduct.tags = req.body.tags;
    newProduct.imageUrls = req.body.imageUrls;
    newProduct.quantity = req.body.quantity;
    newProduct.addedBy = req.user._id;
    newProduct.addedOn = new Date();

    newProduct.save((err, savedProduct) => {
      return (err || !savedProduct) ? error.dbError(res, err, 'Error creating new product') : success();

      function success() {
        savedProduct.initialize()
          .then(() => {
            res.status(200).json(savedProduct);
          })
          .catch((catchErr) => {
            console.log(catchErr);
            return error.stdError(res, null, 1);
          });
      }

    });
  } catch (e) {
    return error.stdError(res, null, 1);
  }


});