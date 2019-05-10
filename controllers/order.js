const mongoose = require('mongoose');
var OrderSchema = require('../models/order.model');
const {sendTextMessage} = require('./messenger');

const Order = mongoose.model('OrderSchema');

const createOrder = async (obj) => {
    const order =  await new Order ({
        userId: obj.id,
        name: obj.first_name + " " + obj.last_name,
        product: obj.name,
        type: obj.type,
        image: obj.orderImg,
        description: obj.description,
        time: Date.now() + obj.duration * 86400000,
        price: obj.price,
        phone: obj.telephone,
        userImage: obj.profile_pic
    }).save();

    return order._id;
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find();
    return res
    .status(200)
    .send({
        errorCode: 0,
        message: 'Success',
        data: orders
    });
}

const updateOrder = async (req, res) => {
    const order = await Order.findByIdAndUpdate(
    req.body._id,
    { 
        $set: { 
            "buyerName": req.body.name,
            "buyerPhone": req.body.phone,
            "price": req.body.price
            }
    },
        {
            new: true
        }
    );
    console.log(order);
    await sendTextMessage(
        order.userId, order.buyerName + " (📱"+ order.buyerPhone +") je licitirao u vrednošću od " + order.price
    );

    return res
    .status(200)
    .send({
        errorCode: 0,
        message: 'Success'
    });
}

const viewOrder = async (req, res) => {
    const order = await Order.findById(req.body._id);
    return res
    .status(200)
    .send({
        errorCode: 0,
        message: 'Success',
        data: order
    });
}

module.exports = {createOrder, getAllOrders, updateOrder, viewOrder};