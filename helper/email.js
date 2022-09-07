const nodemailer = require("nodemailer");

module.exports.kirimEmail = async(dataEmail) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        requireTLS: true,
        auth: {
          user: "tjdadeveloper@gmail.com", 
          pass: "mgvs mpmn ynqu cafk", 
        }
      });

      await transporter.sendMail(dataEmail);
};