const { default: mongoose } = require("mongoose");

const authSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  password: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const Auth = mongoose.model("auth", authSchema);

module.exports = Auth;
