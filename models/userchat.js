const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const UserChat = sequelize.define("user_chat", {
   user_id : {
      type: DataTypes.INTEGER,
      primaryKey:true,
      // references:'user',
      // referencesKey:"user_id",
   },
   friend_id : {
      type: DataTypes.INTEGER,
      
      // references:'user',
      // referencesKey:"user_id",
   },
   room_id : {
      type: DataTypes.INTEGER,
      primaryKey:true,
      // references:'chat_room',
      // referencesKey:"room_id",
   }
},{
    timestamps:false,
    freezeTableName:true
})

UserChat.sync();

module.exports = UserChat;