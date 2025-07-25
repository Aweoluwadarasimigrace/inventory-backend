const { default: mongoose } = require("mongoose");

const authSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  firstname: {
    type: String,
  },
  username: {
    type: String,
  },
  lastname: {
    type: String,
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
    minlength: 8,
    required: true,
  },
  country: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  role: {
    type: String,
    enum: ["admin", "sales representative", "product manager"],
    default: "admin",
  },
   profilepicture: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
  },
});

const Auth = mongoose.model("auth", authSchema);

module.exports = Auth;
