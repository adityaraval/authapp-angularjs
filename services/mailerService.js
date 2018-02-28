var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:"",
        pass: ""
    }
});

var sendMailService = (mailOptions,callback)=>{
    if(mailOptions){
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                callback(error);
            } else {
                callback(null,info.response);
            }
        });
    }
}


module.exports = {sendMailService:sendMailService};