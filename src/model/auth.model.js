const { default: mongoose } = require("mongoose");


const authSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verified: {
        type: String,
        default: false
    },
})


const Auth = mongoose.model("auth", authSchema)

module.exports = Auth