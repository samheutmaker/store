const mongoose = require('mongoose');
const stripe = require(__dirname + '/../lib/stripe');


const productMediaSchema = mongoose.Schema({
  name: String,
  addedOn: Date,
  imageUrlHash: Object,
  isDefaultImage: Boolean,
});


const productSchema = mongoose.Schema({
  stripe_id: String, // Stripe product id
  stripe_SKUs: Object, // Stripe SKU ids
  sizes: Object, // The available sizes and their quantities
  name: String, // Name of product
  desc: String, // Description of product
  SKU: String, // Product SKU
  gender: String, // Meant for which Gender
  cost: Number, // Cost, as a number
  season: String, // The best seaon for this type of clothing
  type: String, // Pants, short, shirt, etc
  tags: Array, // Any adjectives used to describe the product
  thumbnail: String,
  media: [productMediaSchema], // Urls for product images
  addedOn: Date,
  addedBy: String
});



productSchema.methods.initialize = function() {
  return new Promise((resolve, reject) => {
    var name = this.name;
    var desc = this.desc;


    stripe.products.create({
      name: name,
      description: desc,
      attributes: ['size', 'gender'],
    }, (err, product) => {
      if (err) reject(err);

      this.stripe_id = product.id;

      var newSKUs = Object.keys(this.sizes).map((size, sizeIndex) => {
        var newSKUOptions = {
          product: product.id,
          attributes: {
            size: size,
            gender: this.gender
          },
          price: this.cost * 100,
          currency: 'usd',
          inventory: {
            type: 'finite',
            quantity: this.sizes[size]
          }
        };
        return createNewSKU(newSKUOptions);
      });

      Promise.all(newSKUs)
        .then((data) => {
          if (data && data.length) {

            var newOptions = {};

            data.forEach((SKUItem, SKUItemIndex) => {
              newOptions[SKUItem.attributes.size] = SKUItem.id
            });

            this.stripe_SKUs = newOptions;
          }

          this.save((err2, newProduct) => {
            (err2) ? reject(err2) : resolve();
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};



productSchema.methods.updateProduct = function(newProduct) {
  return new Promise((resolve, reject) => {
    if (newProduct) {
      var skusToUpdate = [];
      var skusToCreate = [];

      Object.keys(newProduct.sizes).forEach((size, sizeIndex) => {
        if (!this.sizes[size]) {
          skusToCreate.push(size);
        } else if (this.sizes[size] != newProduct.sizes[size]) {
          skusToUpdate.push(size);
        }
      });

      var createdSKUPromises = skusToCreate.map((size, sizeIndex) => {
        var newSKUOptions = {
          product: newProduct.stripe_id,
          attributes: {
            size: size,
            gender: this.gender
          },
          price: this.cost * 100,
          currency: 'usd',
          inventory: {
            type: 'finite',
            quantity: newProduct.sizes[size]
          }
        };

        return createNewSKU(newSKUOptions);
      });

      var updatedSKUPromises = skusToUpdate.map((size, sizeIndex) => {
        var updatedSKUOptions = {
          inventory: {
            quantity: newProduct.sizes[size]
          }
        };
        return updateSKU(this.stripe_SKUs[size], updatedSKUOptions);
      });

      Promise.all(createdSKUPromises.concat(updatedSKUPromises))
        .then((data) => {
          if (data && data.length) {

            var newSKUs = {};

            data.forEach((SKUItem, SKUItemIndex) => {
              newSKUs[SKUItem.attributes.size] = SKUItem.id
            });

            this.stripe_SKUs = Object.assign({}, this.stripe_SKUs, newSKUs);
          }

          this.save((err2, newProduct) => {
            (err2) ? reject(err2) : resolve();
          });
        })
        .catch((err) => {
          resolve(err);
        });
    }
  });
}


productSchema.methods.removeAllSKUs = function() {
  return new Promise((resolve, reject) => {
    if (Object.keys(this.stripe_SKUs).length) {

      SKUPromises = Object.keys(this.stripe_SKUs)
        .map((size, sizeIndex) => {
          return removeSKU(this.stripe_SKUs[size]);
        });

      Promise.all(SKUPromises)
      .then((res) => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });

    } else {
      reject('No SKUs');
    }
  });
};

function createNewSKU(options) {
  return new Promise((resolve, reject) => {
    stripe.skus.create(options, function(err, sku) {
      (err || !sku) ? reject(err) : resolve(sku);
    });
  });
}

function updateSKU(skuId, options) {
  return new Promise((resolve, reject) => {
    if (skuId) {
      stripe.skus.update(skuId, options, (err, sku) => {
        (err || !sku) ? reject(err) : resolve(sku);
      })
    } else {
      reject('No Stripe ID');
    }
  });
}

function removeSKU(skuId) {
  return new Promise((resolve, reject) => {
    if (skuId) {
      stripe.skus.del(skuId, (err, sku) => {
        (err || !sku) ? reject(err) : resolve(sku);
      });
    }
  });
}


module.exports = exports = mongoose.model('product', productSchema);