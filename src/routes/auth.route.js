const express = require("express");
const { loginUser, registerUser, verifyEmail, resendEmail } = require("../controller/auth.controller");

const router = express.Router();
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail)
router.post("/login", loginUser);
router.post("/resend-verification", resendEmail)

module.exports = router;
