import { resType as r } from "../lib/response.js";

export const checkForAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (
      !auth ||
      !auth.startsWith("Bearer ") ||
      auth.split(" ")[1]?.trim() !== process.env.AUTH_KEY
    ) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "Unauthorized action.",
        success: false,
      });
    }
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
