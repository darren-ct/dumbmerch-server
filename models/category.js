const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Category = sequelize.define("category", {
    category_id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    category_name : {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false
    },

},{
    timestamps:false,
    freezeTableName:true
})

Category.sync();

module.exports = Category;