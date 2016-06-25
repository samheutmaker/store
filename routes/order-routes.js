 const express = require('express');
 const jsonParser = require('body-parser').json();


 const authCheck = require(__dirname + '/../lib/check-token');
 const error = require(__dirname + '/../lib/errors');
 const util = require(__dirname + '/../lib/utilities');
 const a = require(__dirname + '/../lib/analytics');
 const Order = require(__dirname + '/../models/order.js');
 const SendGrid = require(__dirname + '/../lib/sendgrid');


 const orderRouter = module.exports = exports = express.Router();



 orderRouter.get('/', authCheck, (req, res) => {
 	try {
 		Order.find({

 		}, (err, orders) => {
 			return (err || !orders) ? error.dbError(res, err, 'Error placing order.') : success();

 			function success() {


 				var EmailTemplate = require('email-templates').EmailTemplate
 				var path = require('path')

 				var templateDir = path.join(__dirname, '/../templates', 'transactional', 'confirm-email');

 				var newsletter = new EmailTemplate(templateDir)
 				var user = {
 					name: 'Joe',
 					pasta: 'spaghetti'
 				}
 				newsletter.render(user, function(err, result) {
 					console.log(err);
 					console.log(result);
 				})

 				var async = require('async')
 				var users = [{
 					name: 'John',
 					pasta: 'Rigatoni'
 				}, {
 					name: 'Luca',
 					pasta: 'Tortellini'
 				}]

 				async.each(users, function(user, next) {
 					newsletter.render(user,null, function(err, result) {
 						if (err) return next(err)
 							console.log(results.html);
 							console.log(err);
 							// result.text 
 							// result.subject 
 					})
 				}, function(err) {
 					console.log(err);
 				})


 				// var requestBody = mail.toJSON()
 				// var request = SendGrid.emptyRequest()
 				// request.method = 'POST'
 				// request.path = '/v3/mail/send'
 				// request.body = requestBody
 				// SendGrid.API(request, function(response) {
 				// 	console.log(response.statusCode)
 				// 	console.log(response.body)
 				// 	console.log(response.headers)
 				// 	return res.status(200).json(orders);
 				// })


 				return res.status(200).json(orders);


 			}
 		});

 	} catch (e) {
 		return error.stdError(res, null, 1);
 	}
 });