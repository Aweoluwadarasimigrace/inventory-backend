const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { getOverview } = require("../controller/reports.controller");
const router = express.Router();
router.use(verifyToken);

router.get("/overview", getOverview);
router.get("/daily-sales", getDailySales);

module.exports = router;