import { Owner } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";

export const updateAccountTypeController = async (req, res) => {
  try {
    const { role, uid } = req.query;
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
