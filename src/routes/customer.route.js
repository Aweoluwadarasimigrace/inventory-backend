const express = require("express")
const { verifyToken } = require("../middleware/verifytoken.middleware")
const { getAllCustomer, createCustomer, editCustomer, deleteCustomer, getPdfDownloadCustomer } = require("../controller/customer.controller")

const router = express.Router()
router.use(verifyToken)
router.get("/getallcustomer", getAllCustomer)
router.post("/createcustomer", createCustomer)
router.patch("/updatecustomer/:id", editCustomer)
router.delete("/deletecustomer/:id", deleteCustomer)
router.get("/getpdfdownload", getPdfDownloadCustomer)
module.exports = router