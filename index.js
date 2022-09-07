const express = require("express");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");

// const {kirimEmail} = require("./helper/email");
const jwt = require("jsonwebtoken");
const {sendErr} = require("./helper/other")
require("dotenv").config();

const User = require("./models/user");
const Chatroom = require("./models/chatroom");
const Message = require("./models/message");
const {notification} = require("./controller/transactions")


const app = express();

// Middleware
const verifyAdmin = require("./middleware/verifyAdmin");
const verifyJWT = require("./middleware/verifyJWT");

// Connect
const sequelize = require("./config/connect");

sequelize.authenticate().then(()=>{
    console.log("connected")
});

// Cors and Socket
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin: "https://dumbmerch-client.vercel.app",
        methods: ["GET","POST","PUT","DELETE"]
    }
});


  
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("uploads"));



app.use("/api/v1", require("./routes/auth"));
app.post("/api/v1/notification",notification)

// CHECK USER
app.use(verifyJWT);

// ROUTES


app.use("/api/v1/", require("./routes/categories"));
app.use("/api/v1/" , require("./routes/products"));
app.use("/api/v1/profile/", require("./routes/profiles"));
app.use("/api/v1/",require("./routes/users"))
app.use("/api/v1/", require("./routes/chats"));
app.use("/api/v1/", require("./routes/transactions"));
app.use("/api/v1/",require("./routes/favorites"));

//Socket

io.on("connection", (socket)=>{
    console.log(socket.id + "  connected")

    socket.on("join_room", (data)=>{
         const rooms = data.room_ids;
         
         socket.join(rooms);
         
    });

    socket.on("send_message", async(data)=>{
        const {userId,roomID,message} = data;
        

        // insert and update database
        try {
             
            // Create and update
             const chatSent = await Message.create({
             room_id : roomID,
             sender_id : userId,
             body :  message ,
             });
      
             await Chatroom.update({last_msg:chatSent.body},{
               where : {room_id:chatSent.room_id}
             });


             return io.in(roomID).emit("message_sent", {
                roomid: roomID
             });

           
      
             } catch(err) {
                return socket.emit("message_fail",{
                message:"Server Error"
              })
             };
    })


    socket.on("disconnect" , ()=>{
        console.log(socket.id + "disconnected")
    })
})



server.listen(process.env.PORT || 5000,()=>{
    console.log("connected")
});
