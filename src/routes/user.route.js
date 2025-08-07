const express = require("express")
const { createUserByAdmin, getUserByAdmin, getAllUser, updateUser, searchForUser, updateUserByAdmin, deleteUser } = require("../controller/user.controller")
const { verifyToken, verifyIsAdmin } = require("../middleware/verifytoken.middleware")
const router = express.Router()

router.get("/search", searchForUser)
router.use(verifyToken)
router.get("/getsingleuser", getAllUser)
router.patch("/updateUser", updateUser)
router.use(verifyIsAdmin)
router.post("/createuser",createUserByAdmin)
router.get("/getuser", getUserByAdmin ),
router.patch("/updateuserbyadmin/:id", updateUserByAdmin)
router.delete("/deleteuser/:id", deleteUser)



module.exports = router