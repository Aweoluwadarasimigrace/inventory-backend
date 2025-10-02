const express = require("express");
const { loginUser, registerUser, logOut, verifySession} = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/verifytoken.middleware");

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", verifyToken, verifySession);
router.post("/logout", logOut);

module.exports = router;
