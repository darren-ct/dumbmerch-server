const express = require("express");
const router = express.Router();

const { getTransactions, postTransaction } = require("../controller/transactions");


router.get("/transactions", getTransactions);
router.post("/transaction" , postTransaction);



module.exports = router;