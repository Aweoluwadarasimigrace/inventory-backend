const express = require("express");
const { verifyToken } = require("../middleware/verifytoken.middleware");
const { createSalesReturn, getSalesReturns, updateSalesReturn, deleteSalesReturn, getSalesReturnPdf } = require("../controller/return.controller");
const router = express.Router();

router.use(verifyToken);

router.get("/getsalesreturns", getSalesReturns);
router.post("/createsalesreturn", createSalesReturn);
router.patch("/updatesalesreturn/:id", updateSalesReturn);
router.delete("/deletesalesreturn/:id", deleteSalesReturn);
router.get("/salesreturnpdf", getSalesReturnPdf);
module.exports = router;