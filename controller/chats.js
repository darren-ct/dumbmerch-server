const Chatroom = require("../models/chatroom");
const Message = require("../models/message");
const UserChat = require("../models/userchat");

const {sendErr} = require("../helper/other")
const sequelize = require("../config/connect")
const { QueryTypes } = require('sequelize');


const getMessages = async(req,res) => {
     const roomID = req.params.id;
     const userID = req.user.id;

     const query = `
     SELECT profile.profile_img , user.user_id, user.username, message.body , 
     HOUR(message.createdAt) AS hour,
     MINUTE(message.createdAt) AS minute,
     DAY(message.createdAt) AS day,
     MONTH(message.createdAt) AS month,
     YEAR(message.createdAt) AS year,
     message.sender_id,
     message.message_id
     FROM user_chat INNER JOIN user
     ON user.user_id = user_chat.friend_id
     AND user_chat.room_id = ${roomID}
     AND user_chat.user_id =${userID}
     INNER JOIN profile
     ON user.user_id = profile.user_id
     INNER JOIN message
     ON message.room_id = user_chat.room_id
     `

     try {

      const messagesList = await sequelize.query(
         query, {type:QueryTypes.SELECT}
      );

      if(!messagesList){
         return sendErr("Room cannot be found",res)
      };

      return res.status(201).send({
         status:"Success",
         data : {
            messages : messagesList.map(msg => {
               return {
                  ...msg, profile_img:process.env.SERVER_URL + msg.profile_img
               }
            })
         }
      });

     } catch(err) {
        console.log(err)
        return sendErr("Server Error",res)
     }
   
};

const postMessage = async(req,res) => {
    const roomID = req.params.id;
    const userId = req.user.id;
    const {message} = req.body;

    try {
      const chatSent = await Message.create({
      room_id : roomID,
      sender_id : userId,
      body :  message ,
    });

       await Chatroom.update({last_msg:chatSent.body},{
         where : {room_id:chatSent.room_id}
       });

      return res.status(201).send({
        status:"Success"
      });

    } catch(err) {
      return sendErr("Server error",res)
    };

    
};

const deleteMessage = async(req,res) => {

};

const getChatList = async(req,res) => {
    const userID = req.user.id;

    const query = `
    SELECT profile.profile_img, user.username, user.user_id , chat_room.last_msg , chat_room.room_id,
    HOUR(chat_room.updatedAt) AS hour,
    MINUTE(chat_room.updatedAt) AS minute,
    DAY(chat_room.updatedAt) AS day,
    MONTH(chat_room.updatedAt) AS month,
    YEAR(chat_room.updatedAt) AS year
    FROM user_chat INNER JOIN chat_room
    ON user_chat.room_id = chat_room.room_id AND user_chat.user_id = ${userID}
    INNER JOIN user
    ON user_chat.friend_id = user.user_id
    INNER JOIN profile
    ON user.user_id = profile.user_id
    ORDER BY chat_room.updatedAt DESC
    `

    try{

      const chatList = await sequelize.query(
         query, {type:QueryTypes.SELECT}
      );

      

    return res.status(201).send({
      status:"Success",
      data : {
         messages : chatList.map(chat => {
            return {
               ...chat , profile_img : process.env.SERVER_URL + chat.profile_img
            }
         })
      }
    })


    } catch(err) {
      console.log(err)
          return sendErr("Server Error",res)
    };
  
};


const createChat = async(req,res) => {
 const friendId = req.params.id;
 const userId = req.user.id;


 try {

    //  No need to make new room kalau udah ada
     const previousChat = await UserChat.findAll({
        where : {user_id:userId, friend_id:friendId},
        attributes : ["room_id"]
     }); // OR SEBALIKNYA

   

     if(previousChat.length !== 0){
        const room_id = previousChat[0].room_id;

        return res.status(201).send({
            status:"Success",
            data : {
              room_id 
            }
       });
          
     };

    //  Kalau belum ada
       // create room
     const newChatRoom = await Chatroom.create();

     
      
       // create 2 userchat
     const userChat = await UserChat.create({
        user_id : userId,
        friend_id : friendId,
        room_id : newChatRoom.room_id

     });

     const userChat2 = await UserChat.create({
        user_id : friendId,
        friend_id : userId,
        room_id : newChatRoom.room_id
     });

        //create first message   
     const firstMessage = await Message.create({
        room_id : newChatRoom.room_id,
        sender_id : userId,
        body :  "Hi" ,

     });

         //   Update room
      await Chatroom.update({
         last_msg : firstMessage.body
      },{
         where : {room_id : newChatRoom.room_id}
      })


     return res.status(201).send({
          status:"Success",
          data : {
            room_id : newChatRoom.room_id 
          }
     });
     
 } catch(err) {

    console.log(err)
    return sendErr("Server Error",res)

 }
};



module.exports = {getMessages,postMessage,deleteMessage,getChatList,createChat};
