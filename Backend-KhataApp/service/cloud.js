import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import resType from "../lib/response.js";
import dotenv from "dotenv"

dotenv.config({});
if (
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.MONGO_DB_URI
) {
  throw new Error("Missing required environment variables.");
}
const config = {
  cloud_name: "dgki5gnzf",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(config);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connect to DB");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "CANNOT connect to the MongoDB!"
    );
  }
};
const uploadToCloudinary = async (assetPath) => {
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(assetPath);
    if (!cloudinaryResponse.url) {
      return {
        code: resType.INTERNAL_SERVER_ERROR.code,
        url: null,
      };
    }
    return {
      code: resType.OK.code,
      url: cloudinaryResponse.url,
    };
  } catch (error) {
    return {
      code: resType.INTERNAL_SERVER_ERROR.code,
      url: null,
    };
  }
};

export { connectDB, uploadToCloudinary };
