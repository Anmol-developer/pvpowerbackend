const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserSchema = new Schema({
    username : String,
    email: {type:String, unique: true},
    password: String,
    isCustomer: {type: Boolean, default: true}
})

const User = mongoose.model('User', UserSchema);
module.exports = {User};