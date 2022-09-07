const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Transaction = sequelize.define("transaction", {
    transaction_id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    buyer_id : {
        type: DataTypes.INTEGER,
        allowNull:false
        // references:'user',
        // referencesKey:"user_id",
    },
    product_id : {
        type: DataTypes.INTEGER,
        // references:'product',
        // referencesKey:"product_id",
    },

    transaction_qty : {
       type:DataTypes.INTEGER,
       allowNull:false
    },
        
    total : {
        type: DataTypes.INTEGER,
        allowNull:false
    },

    status : {
        type: DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:true,
    freezeTableName:true
})

Transaction.sync();

module.exports = Transaction;