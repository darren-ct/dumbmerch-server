const {QueryTypes} = require("sequelize");
const sequelize = require("../config/connect");
const {sendErr} = require("../helper/other");


module.exports.getUser = async(req,res) => {
    const userID = req.user.id;
    

     const query = `
     SELECT user.username, user.user_id, user.isAdmin , profile.profile_img 
     FROM user LEFT JOIN profile
     ON user.user_id = profile.user_id 
     WHERE user.user_id != ${userID}
     `;

     try{

        const users = await sequelize.query(query,{type:QueryTypes.SELECT});

        console.log(users)

        return res.status(201).send({
              status:"Success",
              data : {
                   users : users.map(user => {
                       return {...user, profile_img : process.env.SERVER_URL + user.profile_img}
                   })
              }
        });


     } catch(err) {

      return sendErr("Error in server", res)

     }



};
