const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const database = require('./helpers/database');

//import routes
const indexRouter = require('./routes');
const productsRouter = require('./routes/products');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Adding routes
app.use('/', indexRouter);
app.use('/products', productsRouter);

module.exports = app;
