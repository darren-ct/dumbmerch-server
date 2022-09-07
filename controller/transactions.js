const Transaction = require("../models/transaction");
const Product = require("../models/product");
const User = require("../models/user");

const sequelize = require("../config/connect")
const { QueryTypes } = require('sequelize');
const {sendErr} = require("../helper/other");

const midTransClient = require("midtrans-client");
const nodemailer = require("nodemailer");


const getTransactions = async(req,res) => {
    const userID = req.user.id;

    const query = `
    SELECT transaction_id, status , EXTRACT( DAY FROM createdAt) AS day, EXTRACT( MONTH FROM createdAt) AS month, EXTRACT( YEAR FROM createdAt) AS year, transaction_qty, total, product.product_id, price, product_name, product_img, product.desc
    FROM transaction INNER JOIN product 
    ON transaction.product_id = product.product_id AND transaction.buyer_id = ${userID}
    `

    try {
         const mytransaction_products = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );
         
        
         return res.status(201).send({
            status : "Success",
            data : {
                transactions : mytransaction_products.map(item => {
                    return {
                        id : item.transaction_id,
                        product : {
                           id: item.product_id,
                           image: process.env.SERVER_URL + item.product_img,
                           title : item.product_name ,
                           price: item.price
                        },
                        qty : item.transaction_qty,
                        price: item.total ,
                        day : item.day ,
                        month : item.month,
                        year : item.year,
                        status: item.status
                    }
                })
            }
         })

    } catch(err) {
        return sendErr("Error in server",res)
    }
      
};

const postTransaction = async(req,res) => {
    const userID = req.user.id;
    
    const {idProduct,qty} = req.body;
    
    if(qty < 1){
        return sendErr("Quantity must be greater than 0",res)
    }

try{

    const productBought = await Product.findOne(
        {where: {product_id:idProduct},
         attributes: ["price"]
        }
        );

    

    if(!productBought){
        return sendErr("Product doesnt exist",res)
    }
    

    const total = productBought.price * qty;


  const transaction = await Transaction.create({
      transaction_id : parseInt(idProduct + Math.random().toString().slice(3,8)),
      buyer_id : userID,
      product_id : idProduct,
      transaction_qty : qty,
      total : total,
      status : "pending"
  });


//   Mid trans time
let snap = new midTransClient.Snap({
    isProduction:false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

let parameter = {
    transaction_details: {
        order_id: transaction.transaction_id,
        gross_amount: total
    },
    credit_card:{
        secure : true
    },
    customer_details: {
        email: req.user.email,
        username : req.user.name
    }
}

const payment = await snap.createTransaction(parameter);


  return res.status(201).send({
      status:"Success",
      payment : payment
  });

    } catch(err) {

        return sendErr("Server error",res)

    }

};

const notification = async(req,res) => {
      try {
       
          
          // Create core
         const core = new midTransClient.CoreApi();

         core.apiConfig.set({
                 isProduction:false,
                 serverKey: process.env.MIDTRANS_SERVER_KEY,
                 clientKey:process.env.MIDTRANS_CLIENT_KEY
                 });

          const statusResponse = await core.transaction.notification(req.body);

          let orderId = statusResponse.order_id;
          let transactionStatus = statusResponse.transaction_status;
          let fraudStatus = statusResponse.fraud_status;
   
          console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);
   
          // Sample transactionStatus handling logic
   
          if (transactionStatus == 'capture'){
              if (fraudStatus == 'challenge'){
                 
                  sendEmail("pending",orderId)
                  updateTransaction("pending",orderId)
                  res.status(200);
              } else if (fraudStatus == 'accept'){
                sendEmail("success",orderId)
                updateProduct(orderId)
                updateTransaction("success",orderId)
                res.status(200);
              }
          } else if (transactionStatus == 'settlement'){
              sendEmail("success",orderId);
              updateTransaction("success",orderId);
              res.status(200);
          } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'){
            
               sendEmail("failed",orderId)
               updateTransaction("failed",orderId);
               res.status(200)
          } else if (transactionStatus == 'pending'){
             sendEmail("pending",orderId)
             updateTransaction("pending",orderId)
             res.status(200)
          }

      } catch(err) {
           console.log(err)
      }
}


// other functions

const updateTransaction = async(status,orderId) => {
       await Transaction.update({
        status : status
       },{
        where : {
            transaction_id : orderId
        }
       });
};

const updateProduct = async(orderId) => {
      const transaction = await Transaction.findOne({
        where :  { transaction_id : orderId },
        attributes : ["product_id","transaction_qty"]
      });

      const product = await Product.findOne({
        where : {product_id : transaction.product_id },
        attributes : ["product_qty"]
      })

      const newQty = product.product_qty - transaction.transaction_qty;

      await Product.update({
        product_qty : newQty
      },{
        where : {
            product_id : transaction.product_id
        }
      });
}

const sendEmail = async(status,transactionId) => {
   
    // transporter
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: process.env.SYSTEM_EMAIL,
            pass: process.env.SYSTEM_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // get transaction data
    const query = `
    SELECT transaction_qty, total , email , username , product_name,price,status
    FROM transaction INNER JOIN user
    ON transaction.buyer_id = user.user_id AND transaction_id = ${transactionId}
    INNER JOIN product 
    ON transaction.product_id = product.product_id
    `

    
         const transactionInfo = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );

        

    // Email options content
    const mailOptions = {
        from : process.env.SYSTEM_EMAIL,
        to: transactionInfo[0].email,
        subject: "Payment Status",
        text: "Your payment is <br/>" + "Done",
        html: `<!doctype html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="description" content="My Page Description">
          
        </head>
        <body style="background-color:#0B0B0B;color:white;padding:32">
           <div style="font-weight:bold;font-size:24;color:rgba(86, 192, 90, 1)"> Dear ${transactionInfo[0].username}, </div>
           <span style="margin-bottom:48;">Your order payment with the total of ${transactionInfo[0].total} has status of ${status}! </span>

           <p>This is your order details:</p>
           <p>Product name: ${transactionInfo[0].product_name} </p>
           <p>Price per product: ${transactionInfo[0].price} </p>
           <p>Quantity : ${transactionInfo[0].transaction_qty} </p>
          <p style="color:rgb(254, 78, 48);font-weight:bold;">Total transaction : ${transactionInfo[0].total} </p>
          

           <span style="color:rgba(86, 192, 90, 1)">Thank you for ordering here!<span>
        </body>
        </html>`
    }

    if(transactionInfo[0].status != status ){
        transporter.sendMail(mailOptions, (err,info)=>{
            if(err) throw err

            console.log(`Email sent: ${info.response}`)

            return res.send({
                status:"Success",
                message: info.response
            })
        })
    }



}

module.exports = {notification,getTransactions,postTransaction};

