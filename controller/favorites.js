const Favorite = require("../models/favorite");
const {sendErr} = require("../helper/other")

const {QueryTypes} = require("sequelize");
const sequelize = require("../config/connect");

const getFavorites = async(req,res) => {
       const userId = req.user.id;

       try {

        const query = `
     SELECT product.product_id, product_name, product_img, price , product_qty
     FROM favorite INNER JOIN product
     ON favorite.product_id = product.product_id 
     WHERE favorite.user_id = ${userId}
     `;

        const favorites = await sequelize.query(query,{type:QueryTypes.SELECT});
           

          return res.status(201).send({
            status: "Success",
            data : {
                favorites : favorites.map(favorite => {
                    return {
                        id:favorite.product_id,
                        image : process.env.SERVER_URL + favorite.product_img,
                        title:favorite.product_name,
                        price: favorite.price,
                        qty:favorite.product_qty,
                        isFavorite : true
                    }
                })
            }
          })
       } catch(err) {
        return sendErr("Server error",res)
       }
}

const deleteFavorite = async(req,res) => {
     const productId = req.params.id;
     const userId = req.user.id;

     try {
        await Favorite.destroy({
            where : {
                user_id : userId,
                product_id : productId
            }
        });

        return res.status(201).send({
            status:"Success"
        })

        


     } catch (err) {
        return sendErr("Server error",res)
     }
};

const postFavorite = async(req,res) => {
      const {id} = req.body;
      const userId = req.user.id;

      console.log("Received")

      try {

        await Favorite.create({user_id:userId,product_id:id});

        return res.status(201).send({
            status:"Success"
        })
      } catch(err) {
        return sendErr("Server error",res)
      }
}

module.exports.getFavorites = getFavorites;
module.exports.deleteFavorite = deleteFavorite;
module.exports.postFavorite = postFavorite;
