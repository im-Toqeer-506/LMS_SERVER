"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
// The main function to send an email
const sendMail = async (options) => {
    // Create a transporter object using SMTP settings from environment variables
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD, //app password
        }
    });
    // Extract values from options
    const { email, subject, template, data } = options;
    // Create the full path to the EJS template file
    const templatePath = path_1.default.join(__dirname, '../mails', template);
    // Render the EJS template to HTML by injecting data into it
    const html = await ejs_1.default.renderFile(templatePath, data);
    // Setup the email content
    const mailOptions = {
        from: process.env.SMTP_MAIL, // sender email
        to: email, // Recipient
        subject, // Subject line
        html // The actual HTML email content
    };
    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
};
exports.default = sendMail;
