const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Favorite = sequelize.define("favorite", {
    product_id : {
        type: DataTypes.INTEGER,
        primaryKey:true
        // reference product
    },
    user_id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
    //     reference user
    }

},{
    timestamps:false,
    freezeTableName:true
})

Favorite.sync();

module.exports = Favorite;