const mongoose = require('mongoose')
const {Schema} = mongoose;

const FileSchema = new Schema({
    username: String,
    email: String,
    date : Date,
    data : Buffer
})

const File = mongoose.model('File', FileSchema);
module.exports = {File};
