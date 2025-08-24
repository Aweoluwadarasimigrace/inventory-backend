const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { getOverview, getDailySales, getMonthlySales, getYearlySales } = require("../controller/reports.controller");
const router = express.Router();
router.use(verifyToken);

router.get("/overview", getOverview);
router.get("/daily-sales", getDailySales);
router.get("/monthly-sales", getMonthlySales);
router.get("/yearly-sales", getYearlySales)
module.exports = router;