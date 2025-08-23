const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { createSalesReturn, getSalesReturns, updateSalesReturn } = require("../controller/return.controller");
const router = express.Router();

router.use(verifyToken);

router.get("/getsalesreturns", getSalesReturns);
router.post("/createsalesreturn", createSalesReturn);
router.patch("/updatesalesreturn/:id", updateSalesReturn);
module.exports = router;