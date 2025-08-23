const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { createSalesReturn, getSalesReturns } = require("../controller/return.controller");
const router = express.Router();

router.use(verifyToken);

router.get("/getsalesreturns", getSalesReturns);
router.post("/createsalesreturn", createSalesReturn);
module.exports = router;