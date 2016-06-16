const express = require('express');
const mongoose = require('mongoose');
const jsonParser = require('body-parser').json();
const db = require(__dirname + '/lib/db')

const PORT = process.env.PORT || 8080;

const MONGO_URI = db.url;

var app = express();


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
  next();
});

app.use(express.static(__dirname + '/www'));


mongoose.connect(MONGO_URI);

var authRoutes = require(__dirname + '/routes/auth-routes');
var userInfoRoutes = require(__dirname + '/routes/user-info-routes');
var shippingRoutes = require(__dirname + '/routes/shipping-routes');
var cartRoutes = require(__dirname + '/routes/cart-routes');

app.use('/auth', authRoutes);
app.use('/user/info', userInfoRoutes);
app.use('/user/cart', cartRoutes);
app.use('/user/shipping', shippingRoutes);

app.listen(PORT, () => {
  console.log('Server up on port ' + PORT);
});
