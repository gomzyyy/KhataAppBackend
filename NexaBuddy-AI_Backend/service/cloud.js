import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import resType from "../lib/response.js";
import dotenv from "dotenv";
import { getCloudinaryPublicIdFromUrl } from "../helpers/auth.helper.js";

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
const uploadToCloudinary = async ({
  path,
  resourceType = "IMAGE",
}) => {
  if (!path) {
    return {
      code: resType.NOT_FOUND.code,
      url: null,
    };
  }
  try {
    const options = {
      IMAGE: {
        resource_type: "image",
        folder: "image_uploads",
      },
      VIDEO: {
        resource_type: "video",
        folder: "video_uploads",
      },
      RAW: {
        resource_type: "raw",
        folder: "nonmedia_uploads",
      },
    };
    if (!options[resourceType]) {
      throw new Error(`Invalid resource type: ${resourceType}`);
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      path,
      options[resourceType]
    );
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

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) {
      return {
        code: resType.NOT_FOUND.code,
        message: "Url is not provided.",
      };
    }
    const publicId = getCloudinaryPublicIdFromUrl(url);
    if (!publicId) {
      return {
        code: resType.INTERNAL_SERVER_ERROR.code,
        message: "Public ID not found",
      };
    }
    await cloudinary.uploader.destroy(publicId);
    return {
      code: resType.OK.code,
      message: "Image deleted successfully",
    };
  } catch (error) {
    return {
      code: resType.INTERNAL_SERVER_ERROR.code,
      message:
        error instanceof Error ? error.message : "Failed to delete the image",
    };
  }
};

export { connectDB, uploadToCloudinary, deleteFromCloudinary };
