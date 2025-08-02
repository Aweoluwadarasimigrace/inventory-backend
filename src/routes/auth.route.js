const express = require("express");
const { loginUser, registerUser, verifyEmail, resendEmail, logOut, verifySession } = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/verifytoken.middleware");

const router = express.Router();
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/resend-verification", resendEmail);
router.get("/verify", verifyToken, verifySession);
router.post("/logout", logOut);

module.exports = router;
