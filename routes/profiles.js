const express = require("express");
const router = express.Router();
const {uploadFile} = require("../middleware/uploadFile");
const { getProfile, postProfile , editProfile} = require("../controller/profiles");

router.get("/",getProfile);
router.post("/", postProfile);
router.put("/", uploadFile("image") , editProfile);


module.exports = router;