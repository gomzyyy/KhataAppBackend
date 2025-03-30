import resType from "../../lib/response.js";
import {Asset } from "../../models/index.js";
import { uploadToCloudinary } from "../../service/cloud.js";

export const setOwner = async (req, res) => {
  try {
    
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Internal server error.`,
      success: false,
    });
  }
};
