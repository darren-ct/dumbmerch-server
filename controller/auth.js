
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Profile = require("../models/profile");
const { Op } = require("sequelize");

const {emailChecker,minimumChecker} = require("../helper/auth");
const {sendErr} = require("../helper/other")


const registerUser = async(req,res) => {


    // Checking format
    if(!emailChecker(req.body.email) || !minimumChecker(req.body.email,8)){
        return sendErr("Email format invalid",res)
    };

    if(!minimumChecker(req.body.name,4)){
        return sendErr("Username minimum 4 characters",res)
    };

    if(!minimumChecker(req.body.password,8)){
        return sendErr("Password minimum 8 characters",res)
    };


    try {
        // Check any duplicate emails and username
        const duplicate = await User.findOne({
            where: {
                [Op.or]: [
                    {email: req.body.email},
                    {username: req.body.name }
                ]
            },
            attributes:["user_id"]
        })

        if(duplicate){
            return sendErr("Username/email is already registered",res)
        };


        // Kalo lolos semua, insert user + profile
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt)

        const newUser = await User.create({
            username: req.body.name,
            email:req.body.email,
            password: hashedPassword,
            isAdmin : true
        });

        await Profile.create({
            user_id : newUser.user_id
        })

        // Create token + response

        
        const token = jwt.sign({
           id : newUser.user_id,
           iat: Date.now(),
           expires : "1d"
        }, process.env.SECRET,
        {
            expiresIn:"1d"
        })

        return res.status(201).send({
             status:"Success",
             data : {
                user : {
                    user_id : newUser.user_id,
                    name : newUser.username,
                    email : newUser.email,
                    token : token,
                    isAdmin : newUser.isAdmin
                }
             }
        })

    } catch (err) {


        return sendErr("Server error",res)

    }

};

const loginUser = async(req,res) => {
    const{email,password} = req.body;


 try{
    //  check apakah email terdaftar
    const match = await User.findOne({
        where: {
            email : email
        } 
    });

    console.log(match.user_id)

    if(!match){
        return sendErr("Email not yet registered",res)
    };


    
    // check input passwordnya
    const matchedPw = match.password;
    const isMatch = bcrypt.compareSync(password,matchedPw);

    if(!isMatch){
        return sendErr("Wrong password",res)
    }


    // kasi token
    const token = jwt.sign({
        id : match.user_id,
        iat: Date.now(),
        expires : "1d"
     }, process.env.SECRET,
     {
         expiresIn:"1d"
     })

    // response
    return res.status(201).send({
        status:"Success",
        data : {
            user : {
                user_id : match.user_id,
                name: match.username,
                email: match.email ,
                token : token,
                isAdmin: match.isAdmin
            }
        }
    }) 

     } catch (err) {

        return sendErr("Email not Found",res)

    }

};

const logoutUser = async(req,res) => {
    return res.status(201).send({
        status:"Success",
        message: "Logged out"
    })
};


module.exports = {registerUser, loginUser, logoutUser};
