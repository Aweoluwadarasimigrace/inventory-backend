const express = require("express");
const router = express.Router();

const {verifyToken} = require("../middleware/verifytoken.middleware");
const { createPurchase } = require("../controller/purchase.controller");

router.use(verifyToken);

router.post("/createpurchase", createPurchase);

module.exports = router;