const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/verifyAdmin");
const { getCategories, getCategory, postCategory , editCategory , deleteCategory} = require("../controller/categories");


router.get("/categories", getCategories);
router.get("/category/:id", getCategory);
router.post("/category", verifyAdmin , postCategory);
router.put("/category/:id", verifyAdmin , editCategory);
router.delete("/category/:id", verifyAdmin , deleteCategory);


module.exports = router;