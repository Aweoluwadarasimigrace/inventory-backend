const express = require("express")
const { createUserByAdmin, getUserByAdmin } = require("../controller/user.controller")
const { verifyToken, verifyIsAdmin } = require("../middleware/verifytoken.middleware")
const upload = require("../middleware/uploads.middleware")
const router = express.Router()

router.use(verifyToken, verifyIsAdmin)
router.post("/createuser", upload.single("image") ,createUserByAdmin)
router.get("/getuser", getUserByAdmin )

module.exports = router