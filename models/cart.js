const mongoose = require('mongoose');
const Product = require(__dirname + '/product');
var staff = require('staff');


var cartItemSchema = mongoose.Schema({
	item_id: String,
	quantity: Number,
	size: String,
	item: Object
});


var CartItem = mongoose.model('cartitem', cartItemSchema);

var cartSchema = mongoose.Schema({
	lastModified: Date,
	items: [cartItemSchema],
	total: Number,
	owner_id: String
});



cartSchema.methods.modifyCart = function(actionPromise, paramsArray) {
	var promiseHolder = [actionPromise.bind(this, paramsArray), this.populate.bind(this)];

	return promiseHolder.reduce((cur, next) => {
		return cur.then(next);
	}, Promise.resolve());

};

cartSchema.methods.addItem = function(paramsObj) {
	function addToCart() {
		return new Promise((resolve, reject) => {

			var updateItem = this.items.filter((el, i) => {
				return (el.item_id == paramsObj.itemId && el.size == paramsObj.size);
			});

			if (updateItem[0]) {
				this.items.forEach((el, i) => {
					if (el.item_id == paramsObj.itemId && el.size == paramsObj.size) {
						el.quantity += paramsObj.quantity;
					}
				})

				this.save((err, data) => {
					(err) ? reject(err) : resolve(data);
				});

			} else {
				this.items[this.items.length] = new CartItem();
				this.items[this.items.length - 1].item_id = paramsObj.itemId;
				this.items[this.items.length - 1].quantity = paramsObj.quantity;
				this.items[this.items.length - 1].size = paramsObj.size;

				this.save((err, data) => {
					(err) ? reject(err) : resolve(data);
				});
			}

		});
	};

	return this.modifyCart(addToCart, paramsObj);
};


cartSchema.methods.removeItem = function(paramsObj) {
	function removeFromCart() {
		return new Promise((resolve, reject) => {
			var itemToRemove = this.items.filter((item, itemIndex) => {
				return (item.item_id == paramsObj.itemId && item.size == paramsObj.size);
			});

			var index = this.items.indexOf(itemToRemove[0]);

			if (index > -1) {
				this.items.splice(index, 1);
				this.save((err, data) => {
					(err) ? reject(err) : resolve(data);
				});
			} else {
				resolve();
			}
		});
	};

	return this.modifyCart(removeFromCart, paramsObj);
}

cartSchema.methods.populate = function() {
	
	return new Promise((resolve, reject) => {
		try {
			if (this.items && this.items.length) {

				var itemsInCart = this.items.map((el, i) => {
					return (el.item_id) ? el.item_id : null;
				});

				Product.find({
					_id: {
						$in: itemsInCart
					}
				}, (err, data) => {
					var hash = {};
					var finalCart = [];

					data.forEach((el, i) => {
						hash[el._id] = el;
					});

					var finalCart = this.items.map((el, i) => {
						var newEl = el;
						newEl.item = hash[newEl.item_id];
						return newEl
					});

					(err) ? reject(err) : resolve(finalCart);

				})
			} else {
				resolve([]);
			}
		} catch (e) {
			console.log(e);
			reject(e);
		}
	});
}

cartSchema.methods.calculateTotal = function() {
	return new Promise((resolve, reject) => {
		try {
			this.total = this.items.reduce((cur, next) => {
				if (cur && cur.price) {
					return cur.price + next.price;
				}
			}, {
				price: 0
			});


			this.save((err, cart) => {
				(err) ? reject(err) : resolve(cart);
			});
		} catch (e) {
			reject(e);
		}
	});
};


module.exports = exports = mongoose.model('cart', cartSchema);