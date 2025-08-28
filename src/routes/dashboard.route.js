
const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { getDashboardStats } = require("../controller/dashboard.controller");

const router = express.Router();
router.use(verifyToken);

router.get("/getstats", getDashboardStats);

module.exports = router;
