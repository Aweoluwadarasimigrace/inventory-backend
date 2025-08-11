const express = require("express")
const { verifyToken } = require("../middleware/verifytoken.middleware")
const { getAllCustomer } = require("../controller/customer.controller")

const router = express.Router()
router.use(verifyToken)
router.get("/getallcustomer", getAllCustomer)

module.exports = router