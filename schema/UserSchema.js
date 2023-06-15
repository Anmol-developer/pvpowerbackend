require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
// const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isCustomer: { type: Boolean, default: true },
  data: [
    {
      date: {
        type: Date,
        default: Date.now, // Sets the default value to the current date and time
      },
      data: Buffer,
    },
  ],
  PredictedData: [
    {
      date: {
        type: Date,
        default: Date.now, // Sets the default value to the current date and time
      },
      randomforest: [
        {
          date: { type: Date },
          time: { type: String },
          PredictedPV: { type: Number },
        },
      ],
      knn: [
        {
          date: { type: Date },
          time: { type: String },
          PredictedPV: { type: Number },
        },
      ],
      lgbm: [
        {
          date: { type: Date },
          time: { type: String },
          PredictedPV: { type: Number },
        },
      ],
      svr: [
        {
          date: { type: Date },
          time: { type: String },
          PredictedPV: { type: Number },
        },
      ],
    },
  ],
  // isCalcDone: {type:Boolean, default:false},
  phone: { type: Number, default: 123456789 },
  address: { type: String, default: "Civil Lines, IIT Roorkee, India" },
  zipCode: { type: Number, default: 123465 },
  designation: { type: String, default: "Product Manager" },
});

const User = mongoose.model("User", UserSchema);
module.exports = { User };
