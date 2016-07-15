const fs = require('fs-extra');
const express = require('express');
const jsonParser = require('body-parser').json();
const flat = require('flat');

const authCheck = require(__dirname + '/../lib/check-token');
const error = require(__dirname + '/../lib/errors');
const util = require(__dirname + '/../lib/utilities');
const a = require(__dirname + '/../lib/analytics');
const stripe = require(__dirname + '/../lib/stripe');
const s3UploadPromise = require(__dirname + '/../lib/s3-client');


const Product = require(__dirname + '/../models/product');


var productRouter = module.exports = exports = express.Router();



// Gets all Products
productRouter.get('/', jsonParser, (req, res) => {
  Product.find({}, (err, data) => {

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
    newProduct.sizes = req.body.sizes;
    newProduct.SKU = req.body.SKU;
    newProduct.gender = req.body.gender;
    newProduct.desc = req.body.desc;
    newProduct.cost = req.body.cost;
    newProduct.season = req.body.season;
    newProduct.type = req.body.type;
    newProduct.tags = req.body.tags;
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
            return error.stdError(res, null, 1);
          });
      }
    });
  } catch (e) {
    return error.stdError(res, null, 1);
  }
});


productRouter.put('/update', authCheck, jsonParser, (req, res) => {
  try {
    var requiredProps = ['_id'];

    if (util.hasRequiredProps(req.body, requiredProps)) {

      Product.findOne({
        _id: req.body._id
      }, (err, product) => {
        if (err || !product) return error.dbError(res, err, 'Error updating product');

        product.updateProduct(req.body)
          .then((data) => {

            var product_id = req.body._id;
            delete req.body._id;
            delete req.body.stripe_SKUs;

            Product.update({
              _id: product_id
            }, flat(req.body), (err, updatedProduct) => {
              return (err || !updatedProduct) ? error.dbError(res, err, 'Error updating product 1') : res.status(200).json({});
            });

          })
          .catch((catchErr) => {
            return error.stdError(res, 'Upate Product Error', 4);
          });
      });
    } else {
      return errors.requiredPropError(res);
    }

  } catch (e) {
    return error.stdError(res, null, 1);
  }
});


productRouter.put('/:id/media/add', authCheck, jsonParser, (req, res) => {
  try {
    var requiredProps = ['id'];

    if (util.hasRequiredProps(req.params, requiredProps)) {

      Product.findOne({
        _id: req.params.id
      })
      .then((product) => {
        var filePath = __dirname + '/../img/';
        var allNewMedia = [];
        req.pipe(req.busboy);

        req.busboy.on('file', (fieldname, file, fileName) => {  
          fstream = fs.createWriteStream(filePath + fileName);
          file.pipe(fstream);

          fstream.on('close', () => {
             s3UploadPromise((filePath + fileName), {})
            .then((versions) => {
              
              var newMedia = {};
              newMedia.imageUrlHash = {};
              newMedia.name = "null";
              newMedia.addedOn = new Date();
              newMedia.isDefaultImage = false;

              versions.forEach((version, versionIndex) => {
                imageUrlHash[version.suffix] = version.url;
              });

              allNewMedia.push(newMedia);

            })
            .catch((err) => {
              return error.stdError(res, 'Add Image S3 Error', 4);
            });
          });
        });


        req.busboy.on('finish', () => {

          console.log(allNewMedia);

          product.media = allNewMedia;
          product.save((err, savedProduct) => {
            return (err || !savedProduct) ? error.dbError(res, err, 'Error adding media') : res.status(200).json(savedProduct);
          });

        });

      })
      .catch((err) => {
        return error.dbError(res, err, 'Error uploading media.');
      });

    } else {
      return errors.requiredPropError(res);
    }

  } catch (e) {
    console.log(e);
    return error.stdError(res, null, 1);
  }

});


productRouter.post('/remove', authCheck, jsonParser, (req, res) => {
  try {
    var requiredProps = ['product_id', 'stripe_id'];

    if (util.hasRequiredProps(req.body, requiredProps)) {

      Product.findOne({
        _id: req.body.product_id
      }, (err, product) => {
        if (err || !product) return error.dbError(res, err, 'Could not find product');

        var shouldRemove = true;

        Object.keys(product.sizes).forEach((size, sizeIndex) => {
          if (product.sizes[size] != 0) {
            shouldRemove = false;
          }
        });

        if (!shouldRemove) return error.stdError(res, 'Item has quantity', 5);

        product.removeAllSKUs()
          .then((data) => {
            stripe.products.del(req.body.stripe_id, (err, confirmation) => {
              if (err || !confirmation) return error.stdError(res, 'Error removing stripe object', 5);

              Product.remove({
                _id: req.body.product_id,
              }, (err, removeInfo) => {
                return (err || !removeInfo) ? error.dbError(res, err, 'Error removing product') : res.status(200).json(removeInfo);
              });
            });
          })
          .catch((catchErr) => {
            return error.stdError(res, 'Remove All SKUs error', 4);
          });
      });
    } else {
      return errors.requiredPropError(res);
    }
  } catch (e) {
    return error.stdError(res, null, 1);
  }
});