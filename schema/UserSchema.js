const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserSchema = new Schema({
    username : {type: String, required:true},
    email: {type:String, unique: true, required : true},
    password: {type: String, required:true},
    isCustomer: {type: Boolean, default: true},
    tokens: [
        {
            token:{type:String, required:true}
        }
    ]
})

//generating jwt token
UserSchema.methods.generateToken = async function(){
    try {
        let token = jwt.sign({_id: this._id}, process.env.SECRET)
        this.tokens = this.tokens.concat({token});
        await this.save();
        return token
    } catch (error) {
        console.log(error);
    }
}
const User = mongoose.model('User', UserSchema);
module.exports = {User};