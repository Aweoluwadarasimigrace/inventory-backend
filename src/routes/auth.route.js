const express = require("express");
const { loginUser, registerUser, verifyEmail } = require("../controller/auth.controller");

const router = express.Router();
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail)
router.post("/login", loginUser);

module.exports = router;
