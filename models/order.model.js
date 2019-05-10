var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var OrderSchema = new Schema(
  {
    userId: {type: String, required: true},
    name: {type: String},
    product: {type: String},
    type: {type: String},
    image: {type: String},
    description: {type: String},
    time: {type: Date},
    price: {type: String},
    phone: {type: String},
    userImage: {type: String},
    buyerName: {type: String},
    buyerPhone: {type: String}
  }
);

module.exports = mongoose.model('OrderSchema', OrderSchema);