const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Product = sequelize.define("product", {
    product_id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    product_name : {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false
    },
    product_img : {
        type: DataTypes.STRING,
        allowNull:false
    },
    product_qty : {
        type: DataTypes.INTEGER,
        allowNull:false
    },

    price : {
        type: DataTypes.INTEGER,
        allowNull:false
    },

    desc : {
        type: DataTypes.STRING,
        allowNull:false
    },

    category_id : {
        type: DataTypes.INTEGER,
        allowNull:false
        // references:'category',
        // referencesKey:"category_id",
    },

},{
    timestamps:false,
    freezeTableName:true
})

Product.sync();

module.exports = Product;