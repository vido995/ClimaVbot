'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const {verifyToken, conversation} = require('./controllers/webhook');

//Set up default mongoose connection
var mongoDB = 'mongodb://staJeVido:carina!1@ds143293.mlab.com:43293/climathon';
mongoose.connect(mongoDB, {useNewUrlParser: true});

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;
var OrderSchema = require('./models/order.model');

const Order = mongoose.model('OrderSchema');
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

const {getAllOrders, updateOrder, viewOrder} = require('./controllers/order');

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

// Index route
app.get('/', async (req, res) => {
	res.send('Hello, Im ClimathonBot. Lets save the planet 🌍');
});

// for Facebook verification

app
	.get('/webhook/', verifyToken)
  .post('/webhook/',conversation)
  .get('/all', getAllOrders)
  .post('/updateOrder', updateOrder)
  .post('/viewOrder', viewOrder);


// Spin up the servers
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});