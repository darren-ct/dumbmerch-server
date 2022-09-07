const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Profile = sequelize.define("profile", {
    user_id : {
        type: DataTypes.INTEGER,
        // references:'user',
        // referencesKey:"id",
        primaryKey:true,
    },
    profile_img : {
        type: DataTypes.STRING,
    },
    gender : {
        type: DataTypes.STRING,
    },
    phone : {
        type: DataTypes.STRING,
    },

    address : {
        type: DataTypes.STRING,
    },
    city : {
        type: DataTypes.STRING,
    },

    country : {
        type: DataTypes.STRING,
    }
},{
    timestamps:false,
    freezeTableName:true
})

Profile.sync();

module.exports = Profile;