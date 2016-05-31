const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
  name: String, // Name of product
  gender: String, // Meant for which Gender
  cost: Number, // Cost, as a number
  season: String, // The best seaon for this type of clothing
  type: String, // Pants, short, shirt, etc
  sizes: Array, // The available size
  tags: Array, // Any adjectives used to describe the product
  imageUrls: Array, // Urls for product images
  quantity: Number, // Number of products,
  addedOn: Date
});



module.exports = exports = mongoose.model('product', productSchema);

