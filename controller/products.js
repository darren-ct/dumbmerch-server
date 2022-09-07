const Product = require("../models/product");
const Category = require("../models/category");
const Favorite = require("../models/favorite")

const fs = require('fs');
const path = require("path"); 

const sequelize = require("../config/connect");
const { Op,QueryTypes } = require("sequelize");
const {minimumChecker} = require("../helper/auth");
const {sendErr} = require("../helper/other");


const getProducts = async(req,res) => {
    const userId = req.user.id;

    try{

        const query = `
        SELECT user_id , product.product_id, product.desc , product_name, product_img, price , product_qty
        FROM favorite RIGHT JOIN product
        ON favorite.product_id = product.product_id AND favorite.user_id = ${userId}
        `

        const products = await sequelize.query(query,{type:QueryTypes.SELECT});

        return res.status(201).send({
            status:"Success",
            data: {
                products : products.map(product => {
                    return {
                        id : product.product_id,
                        image:process.env.SERVER_URL + product.product_img,
                        title:product.product_name,
                        desc:product.desc,
                        price: product.price,
                        qty:product.product_qty,
                        isFavorite: product.user_id ? true : false
                    }
                })
            }
        })

    } catch(err) {
        console.log(err)
        return sendErr(err,res)

    }
    

   
};

const getProduct = async(req,res) => {
    const productID = Number(req.params.id);
    const userId = req.user.id;
    try{
        const product = await Product.findByPk(productID);
        const favorite = await Favorite.findAll({
            where : {
            user_id : userId,
            product_id:productID }
        });

        const isFavorite  = favorite.length === 0 ? false : true;

        if(!product){
            return sendErr("Product not found",res)
        };

        const category = await Category.findByPk(product.category_id);

        if(!category){
            return sendErr("Category not found",res)
        };


        return res.status(201).send({
            status:"Success",
            data: {
                product : {
                    id : product.product_id,
                    image:process.env.SERVER_URL + product.product_img,
                    title:product.product_name,
                    desc:product.desc,
                    price: product.price,
                    qty:product.product_qty,
                    category:category.category_name,
                    isFavorite:isFavorite
                }
            }
        })

    } catch(err) {
        return sendErr("Server error",res)
    }

};

const postProduct = async(req,res) => {
    const file = req.file.filename;
    const{title,desc,price,qty,category} = req.body;

    // Check format
    if(!minimumChecker(title,4)){
        return sendErr("Title minimum 4 characters",res)
    };

    if(!minimumChecker(desc,8)){
        return sendErr("Desc minimum 8 characters",res)
    };

    if(qty < 1 || price < 1){
        return sendErr("Price and quantity must be greater than 0",res)
    };

    try{
        // If not unique throw error
        const duplicate = await Product.findOne({where : {
            product_name : title },
            attributes: ["product_name"]
        });
    
        if(duplicate){
            return sendErr("Other product with this name already exists",res)
        }

        // Check category name
        const categoryMatch = await Category.findOne({where:{
           category_name:category
        }, attributes: ["category_id"]});

        if(!categoryMatch){
            return sendErr("Category doesnt exist",res)
        };

            const product = await Product.create({product_name:title, 
            product_img:file, 
            product_qty:qty, 
            price:price, 
            desc:desc, 
            category_id:categoryMatch.category_id, 
            });


            const image = "http://localhost:3000/"  + file

        
        return res.status(201).send({
            status: "Success",
            data : {
                product : {
                    id : product.product_id,
                    image: image,
                    title: product.product_name,
                    desc : product.desc,
                    price: product.price,
                    qty: product.product_qty,

                }

                }
        })
       
    } catch(err) {
        return sendErr("Server error",res)
    }
};

const editProduct = async(req,res) => {
    const productID = req.params.id;
    const file = req.file.filename;
    

    const{title,desc,price,qty,category} = req.body;

    // Check format
    if(!minimumChecker(title,4)){
        return sendErr("Title minimum 4 characters",res)
    };

    if(!minimumChecker(desc,8)){
        return sendErr("Desc minimum 8 characters",res)
    };

    if(qty < 1 || price < 1){
        return sendErr("Price and quantity  must be greater than 0",res)
    };




    try{
        // If not unique throw error
        const duplicate = await Product.findOne({
            where : {
            product_id : {[Op.ne]:productID},
            product_name : title 
            },
            attributes: ["product_name"]
        });
    
        if(duplicate){
            return sendErr("Product name cannot be the same as others and  should be different with previous name as well",res)
        };



        // Check category id
        const categoryMatch = await Category.findOne({where:{
           category_name:category
        }, attributes: ["category_id"]});

        if(!categoryMatch){
            return sendErr("Category doesnt exist",res)
        };

        
        // delete old file
        const oldImage = await Product.findOne({
            where :{product_id : productID},
            attributes : ["product_img"]
        });

        await Product.update({
            product_name:title, 
            product_img:file, 
            product_qty:qty, 
            price:price, 
            desc:desc, 
            category_id:categoryMatch.category_id,
        },{
            where : {
                product_id : productID,
            }
        });

        fs.unlink(path.join(__dirname,"..","uploads",oldImage.product_img),(err)=>{console.log(err)});

        const newProduct = await Product.findByPk(productID);

        const image =  "http://localhost:3000/" + file;

        return res.status(201).send({
            status: "Success",
            data : {
                product : {
                    id : newProduct.product_id,
                    image: image,
                    title: newProduct.product_name,
                    desc : newProduct.desc,
                    price: newProduct.price,
                    qty: newProduct.product_qty,
                }
            }
        })

    } catch(err) {
        console.log(err);
        return sendErr("Server error",res)
    }
};

const deleteProduct = async(req,res) => {
    const productID = Number(req.params.id);
    
    

    try{

        const product = await Product.findOne({
            where: {product_id : productID},
            attributes: ["product_id","product_img"]
        });

        

        if(!product){
            return sendErr("Product isnt found",res)
        };




        await Product.destroy({
            where : {
                product_id :productID
            }
        });

        // remove image
        fs.unlink(path.join(__dirname,"..","uploads",product.product_img),(err)=>{console.log(err)});

        return res.status(201).send({
            status: "Success",
            data: {
                "id": productID
            }
        })

    } catch(err) {
        console.log(err)
        return sendErr("server error",res)
    }
};

module.exports = {getProducts,getProduct,postProduct,editProduct,deleteProduct};
