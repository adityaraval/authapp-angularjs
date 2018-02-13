const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://todoapp:todoapp@ds125068.mlab.com:25068/todoapp');

module.exports = {mongoose}