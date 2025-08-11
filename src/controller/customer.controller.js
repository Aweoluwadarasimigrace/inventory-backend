const Customer = require("../model/customer.model")

const getAllCustomer = async(req, res)=>{
    try {
        const customer = await Customer.find()
        if(!customer){
            return res.status(400).json({message: "user not found"})
        }
        res.status(200).json(customer)
    } catch (error) {
       return res.status(400).json({ message: "An error occurred", error: error.message })
    }
}

module.exports = {
    getAllCustomer
}