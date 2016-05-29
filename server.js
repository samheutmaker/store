const express = require('express');
const mongoose = require('mongoose');
const jsonParser = require('body-parser').json();
const db = require(__dirname + '/lib/db')

const PORT = process.env.PORT || 3000;

const MONGO_URI = db.url;

var app = express();

app.use(express.static(__dirname + '/www'));


mongoose.connect(MONGO_URI);

var authRoutes = require(__dirname + '/routes/auth-routes');
var shippingRoutes = require(__dirname + '/routes/shipping-routes');
// var productRoutes = require(__dirname + '/routes/product-routes');
// var userRoutes = require(__dirname + '/routes/user-routes');

app.use('/auth', authRoutes);
app.use('/user/shipping', shippingRoutes);

app.listen(PORT, () => {
  console.log('Server up on port ' + PORT);
});
