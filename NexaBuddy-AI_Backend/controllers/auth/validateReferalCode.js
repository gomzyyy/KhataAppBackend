import { resType } from "../../lib/response.js";
import { Owner } from "../../models/index.js";

export const validateReferralCodeController = async (req, res) => {
  try {
    const { rc } = req.query;
    if (!rc) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "No referral code provided.",
        success: false,
      });
    }
    const user = await Owner.findOne({ referralCode: rc });
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Invalid referral code.",
        success: false,
      });
    }
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
