import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({});

const sender_email = process.env.SENDER_EMAIL;
const email_app_password = process.env.EMAIL_APP_PASSWORD;

if (!sender_email || !email_app_password) {
  throw new Error("Sender Email or App Password us unavailable.");
}

export const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: sender_email,
    pass: email_app_password,
  },
});
