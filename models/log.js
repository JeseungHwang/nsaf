var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var logSchema = new Schema({
	timestamp: String,
    logtype: String,
    subject: String,
    message: String
},{
	collection: 'log'
});
 
module.exports = mongoose.model('log', logSchema);