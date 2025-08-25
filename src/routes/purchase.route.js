const express = require("express");
const router = express.Router();

const {verifyToken} = require("../middleware/verifytoken.middleware");
const { createPurchase, getPurchases, updatePurchase, deletePurchase } = require("../controller/purchase.controller");

router.use(verifyToken);

router.post("/createpurchase", createPurchase);
router.get("/getallpurchases", getPurchases);
router.patch("/updatePurchase/:id", updatePurchase);
router.delete("/deletePurchase/:id", deletePurchase);
module.exports = router;