const { default: mongoose } = require("mongoose");

const authSchema = new mongoose.Schema({
  companyName: {
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
    required: true,
  },
  profilepicture: {
    data: Buffer,
    contentType: String,
  },
  country: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "sales"],
    default: "admin",
  },
  firstname: {
    type: String,
  },
  username:{
    type:String
  },
  lastname: {
    type:String
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const Auth = mongoose.model("auth", authSchema);

module.exports = Auth;
