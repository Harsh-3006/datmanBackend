// // smsSender.js

// const sendSMS = async (phone, message) => {
//     console.log(`Sending SMS to ${phone}: ${message}`);
//     return { success: true, message: 'SMS Sent' };
// };

// export default sendSMS;





// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Create a transporter (Use Gmail, SMTP, or other email services)
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: "harshsrms30@gmail.com",  // Your Email
//         pass: "zgdo vxxn yvso tntu"   // App Password or Actual Password
//     }
// });

// // Function to send emails
// const sendSMS = async (email, subject, message) => {
//     const mailOptions = {
//         from: "harshsrms30@gmail.com",
//         to: email,
//         subject: subject,
//         text: message
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log(`📧 Email sent to ${email}: ${info.response}`);
//         return { success: true, message: 'Email Sent' };
//     } catch (error) {
//         console.error(`❌ Error sending email to ${email}:`, error);
//         return { success: false, error: error.message };
//     }
// };

// export default sendSMS;




















import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config({path:'../.env'});
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "harshsrms30@gmail.com",
        pass: process.env.MAILPASS
    }
});

// Function to send emails
const sendSMS = async (email, subject, message) => {
    const mailOptions = {
        from: "harshsrms30@gmail.com",
        to: email,
        subject: subject,
        text: message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.response}`);
        return { success: true, message: 'Email Sent' };
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return { success: false, error: error.message };
    }
};

export default sendSMS;
