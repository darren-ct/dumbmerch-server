const Sequelize = require("sequelize");
const sequelize = new Sequelize ("dumbmerch","root", "NDiwno129*&e",{
    host:"103.181.143.80",
    port : 3306,
    dialect: "mysql"
});


module.exports = sequelize;
