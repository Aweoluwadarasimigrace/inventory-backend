const { default: mongoose } = require("mongoose");


const authSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    contact:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
})


const Auth = mongoose.model("auth", authSchema)

module.exports = Auth