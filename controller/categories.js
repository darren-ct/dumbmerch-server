const Category = require("../models/category");
const {minimumChecker} = require("../helper/auth");
const {sendErr} = require("../helper/other");

const getCategories = async(req,res) => {

try {   
    
   const categories = await Category.findAll();

   return res.status(201).send({
     status: "Success",
     data : {
        categories : categories.map(cat => {return {
            id: cat.category_id,
            name : cat.category_name
        }})
     }
   });

   } catch(err) {
    return sendErr("Server error",res)
   } 
};

const getCategory = async(req,res) => {

    const catID = Number(req.params.id);

  try{
    const category = await Category.findByPk(catID);

    if(!category){
        return sendErr("Category not found",res)
    };

    return res.status(201).send({
        status: "Success",
        data : {
           category : {
             id: category.category_id,
             name: category.category_name
           }
        }
      })

    } catch(err) {
        return sendErr("Server error",res)
    }


};

const postCategory = async(req,res) => {
    const {name} = req.body;

    if(!minimumChecker(name,4)){
        return sendErr("Category name minimum 4 characters",res)
    };

    
    try{
        // If not unique throw error
        const duplicate = await Category.findOne({where : {
            category_name : name }
        });
    
        if(duplicate){
            return sendErr("Category name cannot be the same as others",res)
        }

        const category = await Category.create({category_name:name});

         return res.status(201).send({
                 status:"Success",
                 data : {
                 category : {
                      id : category.category_id,
                     name : category.category_name
                            }
                       }
         })

      } catch(err){

        return sendErr("Server error",res)

      };
       
};

const editCategory = async(req,res) => {
    const catID = Number(req.params.id);
    const {name} = req.body;

    // Check length
    if(name.length === 0){
        return sendErr("Category name cannot be empty",res)
    };

    if(!minimumChecker(name,4)){
        return sendErr("Category name minimum 4 characters",res)
    };


    
  try{
    // Check duplicate
    const duplicate = await Category.findOne({where : {
        category_name : name }, attributes : ["category_name"]
    });

    if(duplicate){
        return sendErr("Category name cannot be the same as others and  should be different with previous name as well",res)
        
    }

    // Check match
    const match = await Category.findOne({
        where : {category_id : catID},
        attributes : ["category_id"]
    });

    if(!match){
        return sendErr("That category doesnt exist",res)
    }


    await Category.update({category_name:name},{
        where : {
            category_id : catID
        }
    });

    return res.status(201).send({
        status:"Success",
        data : {
            category : {
                id : catID,
                name : name
            }
        }
    }) 

   } catch(err) {

    return sendErr("Server error",res)


   }
};

const deleteCategory = async(req,res) => {
    const catID = Number(req.params.id);

  try{

    // Check
    const category = await Category.findOne({where: {
        category_id : catID
    },attributes:["category_id"]});

    if(!category){
        return sendErr("That category doesnt exist",res)
    };

    // Delete 
    await Category.destroy({
        where : {
            category_id : catID
        }
    });

      return res.status(201).send({
        status:"Success",
        data : {
                id : catID
        }
    })

    } catch(err){

        return sendErr("Server error",res)

    }
};

module.exports = {getCategories,getCategory,postCategory,editCategory,deleteCategory};

