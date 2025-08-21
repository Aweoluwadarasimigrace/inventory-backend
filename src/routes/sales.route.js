const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { getSales, createSales, updateSale, deleteSale, getPdfDownloadSales } = require("../controller/sales.controller");
const router = express.Router();

router.use(verifyToken);

router.get("/getallsales", getSales);
router.post("/createsale", createSales);
router.patch("/updatesale/:id", updateSale);
router.delete("/deletesale/:id", deleteSale);
router.get("/salespdf", getPdfDownloadSales);
module.exports = router;