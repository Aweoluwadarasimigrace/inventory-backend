const { default: mongoose } = require("mongoose");

const customerSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  countrycode: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  teamAdmin:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Auth",
    required: true
  }
});


const Customer = mongoose.model("customer", customerSchema);
module.exports = Customer;