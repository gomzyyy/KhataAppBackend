import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { transport } from "../config/email.transport.js";
import { Verify_Password_template } from "../lib/Email_Templates/VerifyPassword.js";
import dotenv from "dotenv";
dotenv.config({});

const SENDER_EMAIL = process.env.SENDER_EMAIL;

const generateToken = (data) => {
  if (!data || !process.env.SECRET_KEY) {
    return;
  }
  const token = jwt.sign(data, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

const validateToken = (token) => {
  if (!token || !process.env.SECRET_KEY) {
    return;
  }
  const decode = jwt.verify(token, process.env.SECRET_KEY);
  return decode;
};

const encryptPassword = async (password) => {
  if (!password) {
    return;
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};
const verifyPassword = async (password, hash) => {
  if (!password || !hash) {
    return;
  }
  const ok = await bcrypt.compare(password, hash);
  return ok;
};

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const parts = url.split("/");
  if (parts.length < 2) return null;
  const fileWithExtension = parts.at(-1);
  const folder = parts.at(-2);
  const [publicId] = fileWithExtension.split(".");
  return `${folder}/${publicId}`;
};

const sendOTPVerificationEmail = async (sendTo, code) => {
  try {
    if (!SENDER_EMAIL) {
      throw new Error("Sender Email not available.");
    }
    if (!sendTo || !code) {
      return;
    }
    const info = await transport.sendMail({
      from: `"no-reply" <${SENDER_EMAIL}>`,
      to: sendTo,
      subject: `Verification otp: ${code.slice(0, 1)}*****`,
      text: "Please verify your email by this OTP.",
      html: Verify_Password_template.replace("{VERIFICATION1_CODE2}", code),
    });
    return info;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? "Error occured while sending email: " + error.message
        : "Unknown server error occured while sending email."
    );
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

function generateReferralCode(userId) {
  const cleanName = userId.trim().replace(/\s+/g, "").toUpperCase();

  const numDigits = Math.floor(Math.random() * 3) + 3; // 3 to 7
  const randomNumber = Math.floor(Math.random() * Math.pow(10, numDigits))
    .toString()
    .padStart(numDigits, "0");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter0 = letters.charAt(
    Math.floor(Math.random() * letters.length)
  );
  const randomLetter1 = letters.charAt(
    Math.floor(Math.random() * letters.length)
  );
  const referralCode = `${cleanName}${randomNumber}${randomLetter0}${randomLetter1}`;

  return referralCode;
}

export {
  generateToken,
  validateToken,
  encryptPassword,
  verifyPassword,
  getCloudinaryPublicIdFromUrl,
  sendOTPVerificationEmail,
  generateOtp,
  generateReferralCode
};
