import { resType as r } from "../../lib/response.js";
import { Owner } from "../../models/index.js";
import { validateToken } from "../../helpers/auth.helper.js";

export const auth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "Unauthorized action.",
        success: false,
      });
    }
    const token = auth.split(" ")[1];
    const decode = validateToken(token);
    if (!decode) {
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
    const user = await Owner.findOne({ ownerId: UID });
    if (!user) {
      return res.status(r.NOT_FOUND.code).json({
        message: "User not found.",
        success: false,
      });
    }
    req.user = user;
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
