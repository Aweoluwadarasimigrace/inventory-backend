const express = require("express")
const { verifyToken } = require("../middleware/verifytoken.middleware")
const { getAllCustomer } = require("../controller/customer.controller")

const router = express.Router()
app.use(verifyToken)
router.get("/", getAllCustomer)

module.exports = router