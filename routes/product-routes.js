const express = require('express');
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');
const authCheck = require(__dirname + '/../lib/check-token');

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

// Add new Product --- NEEDS AUTH
productRouter.post('/new', authCheck, jsonParser, (req, res) => {
  if (req.user._id == '56b2e10dfdef78b4727f54e0') {
    // Create new product
    var newProduct = new Product();
    // Save new product attributes
    newProduct.name = req.body.name;
    newProduct.gender = req.body.gender;
    newProduct.cost = req.body.cost;
    newProduct.season = req.body.season;
    newProduct.type = req.body.type;
    newProduct.sizes = req.body.sizes;
    newProduct.tags = req.body.tags;
    newProduct.imageUrls = req.body.imageUrls;
    newProduct.quantity = req.body.quantity;
    newProduct.addedOn = new Date();

    // Save new product into db
    newProduct.save((err, data) => {

      res.status(200).json({
        msg: 'Successfully Added',
        data: data
      })
    })

  } else {
    res.status(404).json({
      msg: 'Error'
    });
  }

});

