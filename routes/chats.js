const express = require("express");
const router = express.Router();


const { getMessages, postMessage , getChatList , createChat } = require("../controller/chats");

router.get("/messages",getChatList);
router.get("/messages/:id", getMessages);
router.post("/message/:id", postMessage);

router.post("/chat/:id", createChat)



module.exports = router;