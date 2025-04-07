import mongoose from "mongoose";
import { resType } from "../../lib/response.js";
import { Otp, Owner } from "../../models/index.js";
import {
  generateOtp,
  sendOTPVerificationEmail,
} from "../../helpers/auth.helper.js";

export const verifyEmailController = async (req, res) => {
  try {
    const { role, uid, otp } = req.query;

    if (!role || !uid || !otp) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Required queries are not given.",
        success: false,
      });
    }
    if (role !== "Owner" || !mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    const owner = await Owner.findById(uid);
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No Owner found with the given Object ID",
        success: false,
      });
    }
    if (!owner.otp) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "OTP is missing in Owner's Database",
        success: false,
      });
    }
    const realOtp = await Otp.findById(owner.otp);
    if (!realOtp) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "OTP has expired!",
        success: false,
      });
    }
    if (realOtp.otp !== otp) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "OTP didn't matched!",
        success: false,
      });
    } else {
      return res.status(resType.OK.code).json({
        message: "OTP matched!",
        success: true,
      });
    }
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

export const requestOtpController = async (req, res) => {
  try {
    const { role, uid } = req.query;
    const { updatedEmail } = req.body;
    if (!role || !uid) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Required queries are not given.",
        success: false,
      });
    }
    if (role !== "Owner" || !mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    const owner = await Owner.findById(uid);
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No Owner found with the given Object ID",
        success: false,
      });
    }
    if (updatedEmail) {
      owner.email = updatedEmail;
    }
    const otp = generateOtp();
    const newOtp = new Otp({
      otp,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      generatedAt: new Date(),
    });
    owner.otp = newOtp._id;

    await Promise.all([
      owner.save(),
      newOtp.save(),
      sendOTPVerificationEmail(owner.email, otp),
    ]);

    return res.status(resType.OK.code).json({
      message: "OTP sent successfully!",
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
