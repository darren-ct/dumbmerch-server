const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const {uploadFile} = require("../middleware/uploadFile");

const { getProducts, getProduct , postProduct, editProduct, deleteProduct } = require("../controller/products");


router.get("/products",getProducts);
router.get("/product/:id", getProduct);
router.post("/product", verifyAdmin, uploadFile("image"), postProduct); 
router.put("/product/:id", verifyAdmin, uploadFile("image"), editProduct);
router.delete("/product/:id",verifyAdmin, deleteProduct);


module.exports = router;


