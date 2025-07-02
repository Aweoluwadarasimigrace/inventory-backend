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
    }
})


const Auth = mongoose.model("auth", authSchema)

module.exports = Auth