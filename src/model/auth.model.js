const { default: mongoose } = require("mongoose");

const authSchema = new mongoose.Schema({
  companyName: {
    type: String,
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
  },
  role: {
    type: String,
    enum: ["admin", "sales"],
    default: "admin",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth"
  }
});

const Auth = mongoose.model("auth", authSchema);

module.exports = Auth;
