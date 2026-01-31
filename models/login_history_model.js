const mongoose = require('mongoose'); 

const LoginHistorySchema = new mongoose.Schema({
    email: {type: String, required: true}, 
    ip: {type: String},
    device: {type: String}, 
    location: {type: String}, 
    loginTime: {type:Date, default: Date.now}
}); 


module.exports = mongoose.model('LoginHistory', LoginHistorySchema); 