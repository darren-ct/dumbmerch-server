const Sequelize = require("sequelize");
const sequelize = new Sequelize ("103.181.143.80","root", "NDiwno129*&e",{
    host:"",
    port : 3306,
    dialect: "mysql"
});


module.exports = sequelize;
