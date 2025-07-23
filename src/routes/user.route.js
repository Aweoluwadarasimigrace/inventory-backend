const express = require("express")
const { createUserByAdmin, getUserByAdmin, getAllUser } = require("../controller/user.controller")
const { verifyToken, verifyIsAdmin } = require("../middleware/verifytoken.middleware")
const upload = require("../middleware/uploads.middleware")
const router = express.Router()
router.get("getalluser", getAllUser)
router.use(verifyToken, verifyIsAdmin)
router.post("/createuser", upload.single("image") ,createUserByAdmin)
router.get("/getuser", getUserByAdmin )

module.exports = router