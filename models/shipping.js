const mongoose = require('mongoose');

var shippingSchema = mongoose.Schema({
  fullName: {type: String, required: true},
  street: { type: String, required: true},
  country: {type: String, default: 'United States'},
  suite: {type: String},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zip: {type: String, required: true},
  phone: {type: String},
  owner_id: {type: String, required: true},
});


shippingSchema.methods.newAddress = function(info) {
	this.fullName = info.fullName;
	this.street = info.street;
	this.country = info.country;
	this.suite = info.suite;
	this.city = info.city;
	this.state = info.state;
	this.zip = info.zip;
	this.phone = info.phone;
	this.owner_id = owner_id;
	this.save();
};



module.exports = exports = {
	schema: shippingSchema,
	model: mongoose.model('shipping', shippingSchema)
};