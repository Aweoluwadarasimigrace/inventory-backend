
const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { getDashboardStats, getTotalProduct, outofStockProducts, totalCustomer, lowStockProducts, totalSalesPermonth, topSellingProduct } = require("../controller/dashboard.controller");

const router = express.Router();
router.use(verifyToken);

router.get("/getstats", getDashboardStats);
router.get("/gettotalproduct", getTotalProduct);
router.get("/getoutofstockproducts", outofStockProducts);
router.get("/gettotalcustomers", totalCustomer);
router.get("/getlowstockproducts", lowStockProducts);
router.get("/gettotalsalespermonth", totalSalesPermonth);
router.get("/gettopsellingproduct", topSellingProduct);

module.exports = router;
