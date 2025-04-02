import { resType as r } from "../../lib/response.js";
import { Owner, Employee, Partner } from "../../models/index.js";
import { validateToken } from "../../helpers/auth.helper.js";
import { AdminRole } from "../../constants/enums.js";
import mongoose from "mongoose";

export const auth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const { role } = req.query;
    if (
      !auth ||
      !auth.startsWith("Bearer ") ||
      !role ||
      !AdminRole.includes(role)
    ) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "Invalid authorization format or Unauthorized action.",
        success: false,
      });
    }
    const token = auth.split(" ")[1];
    let decode;
    try {
      decode = validateToken(token);
    } catch (error) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "Invalid token.",
        success: false,
      });
    }
    if (!decode || !decode.UID) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "User credentials not found.",
        success: false,
      });
    }
    const { UID } = decode;
    if (!UID) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "User credentials not found.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findOne({ ownerId: UID });
    } else if (role === "Partner") {
      user = await Partner.findOne({ partnerId: UID });
    } else if (role === "Employee") {
      user = await Employee.findOne({ employeeId: UID });
    }
    if (!user) {
      return res.status(r.NOT_FOUND.code).json({
        message: "Token credientials didn't match to any user",
        success: false,
      });
    }
    if(!mongoose.Types.ObjectId.isValid(user._id)){
      return res.status(r.BAD_REQUEST.code).json({
        message: "invalid Object ID. error at mw:auth.js",
        success: false,
      });
    }
    req.uid = user._id;
    next();
  } catch (error) {
    return res.status(r.INTERNAL_SERVER_ERROR.code).json({
      message:
        error instanceof Error
          ? error.message
          : r.INTERNAL_SERVER_ERROR.message,
      success: false,
    });
  }
};
