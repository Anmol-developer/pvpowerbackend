const mongoose = require('mongoose')
const {Schema} = mongoose;

const FileSchema = new Schema({
    username: {type: String, required:true},
    email: {type:String, unique: true, required : true},
    date : Date,
    data : Buffer
})

const File = mongoose.model('File', FileSchema);
module.exports = {File};
