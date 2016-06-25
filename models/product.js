const mongoose = require('mongoose');
const stripe = require(__dirname + '/../lib/stripe');


const productSchema = mongoose.Schema({
  stripe_id: String, // Stripe product id
  name: String, // Name of product
  desc: String, // Description of product
  SKU: String, // Product SKU
  gender: String, // Meant for which Gender
  cost: Number, // Cost, as a number
  season: String, // The best seaon for this type of clothing
  type: String, // Pants, short, shirt, etc
  sizes: Array, // The available size
  tags: Array, // Any adjectives used to describe the product
  imageUrls: Array, // Urls for product images
  quantity: Number, // Number of products,
  addedOn: Date,
  addedBy: String
});



productSchema.methods.initialize = function() {
  return new Promise((resolve, reject) => {
    var attributes = this.tags;
    attributes.length = 5;
    var name = this.name;
    var desc = this.desc;
    

    stripe.products.create({
      name: name,
      description: desc,
    }, (err, product) => {
        if(err) reject(err);

        this.stripe_id = product.id;

        this.save((err2, newProduct) => {
          if(err2) reject(err2);

          resolve();
        });
    });

  });
}



module.exports = exports = mongoose.model('product', productSchema);