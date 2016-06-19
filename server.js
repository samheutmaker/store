const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const db = require(__dirname + '/lib/db')

const PORT = process.env.PORT || 8080;

const MONGO_URI = db.url;

var app = express();


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, token");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
  next();
});

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(__dirname + '/www'));


mongoose.connect(MONGO_URI);

var authRoutes = require(__dirname + '/routes/auth-routes');
var userInfoRoutes = require(__dirname + '/routes/user-info-routes');
var shippingRoutes = require(__dirname + '/routes/shipping-routes');
var productRoutes = require(__dirname + '/routes/product-routes');
var cartRoutes = require(__dirname + '/routes/cart-routes');

app.use('/auth', authRoutes);
app.use('/user/info', userInfoRoutes);
app.use('/user/cart', cartRoutes);
app.use('/user/shipping', shippingRoutes);
app.use('/products', productRoutes);

app.listen(PORT, () => {
  console.log('Server up on port ' + PORT);
});
