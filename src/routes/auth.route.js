const express = require("express");
const { loginUser, registerUser, verifyEmail, resendEmail, logOut} = require("../controller/auth.controller");

const router = express.Router();
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/resend-verification", resendEmail);
router.post("/logout", logOut);

module.exports = router;
