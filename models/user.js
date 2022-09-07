const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const User = sequelize.define("user", {
    user_id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    email : {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false,
    },
    username : {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false,
    },
    isAdmin : {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull:false,
    },

    password : {
        type: DataTypes.STRING,
        allowNull:false,
    }
},{
    timestamps:false,
    freezeTableName:true
})

User.sync()

module.exports = User;