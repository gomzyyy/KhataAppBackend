import { Owner } from "../../../models/index.js";
import resType from "../../../lib/response.js";
import mongoose from "mongoose";

export const getOwnerInfoController = async (req, res) => {
  try {
    const { role, ownerId } = req.query;
    if (!role || !ownerId) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required queries are missing",
        success: false,
      });
    }
    if (role !== "Owner" || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're not authorised of this action",
        success: false,
      });
    }
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Cannot find Owner with the given credentials",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Success",
      data: {
        owner,
      },
      success: false,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message:
        error instanceof Error
          ? error.message
          : "Internal server error occurred.",
      success: false,
    });
  }
};
