import { resType } from "../../lib/response.js";

export const validateTokenController = async (req, res) => {
  try {
    return res.status(resType.OK.code).json({
      message: "Success.",
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `error occured!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  }
};
