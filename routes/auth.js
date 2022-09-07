const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const { registerUser, loginUser , logoutUser } = require("../controller/auth");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/logout", verifyJWT , logoutUser);



module.exports = router;