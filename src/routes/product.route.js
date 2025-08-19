const express = require("express")
const { getAllProduct, createProduct, updateProduct, deleteProduct, getPdfDownloadProduct } = require("../controller/product.controller")
const { verifyToken } = require("../middleware/verifytoken.middleware")
const router = express.Router()
const upload = require("../utils/multer")
router.use(verifyToken)
router.get("/getallproduct", getAllProduct)
router.post("/createproduct", upload.single("image"), createProduct)
router.patch("/updateproduct/:id", upload.single("image"), updateProduct)
router.delete("/deleteproduct/:id", deleteProduct)
router.get("/getpdfdownload", getPdfDownloadProduct)

module.exports = router