import mongoose from "mongoose";
import { resType } from "../../lib/response.js";
import { Employee, Otp, Owner, Partner } from "../../models/index.js";
import {
  generateOtp,
  sendOTPVerificationEmail,
} from "../../helpers/auth.helper.js";
import { AdminRole } from "../../constants/enums.js";

export const verifyEmailController = async (req, res) => {
  try {
    const { role, uid } = req.query;
    const { otp } = req.body;

    if (!role || !uid || !otp) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Required queries are not given.",
        success: false,
      });
    }
    if (!AdminRole.includes(role) || !mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid);
    } else if (role === "Partner") {
      user = await Partner.findById(uid);
    } else if (role === "Employee") {
      user = await Employee.findById(uid);
    } else {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No User found with the given Object ID",
        success: false,
      });
    }
    if (user.email.verified === true) {
      return res.status(resType.NO_CONTENT.code).json({
        message: `Email already verified fot this user.`,
        success: false,
      });
    }
    if (!user.otp) {
      return res.status(resType.NOT_FOUND.code).json({
        message: `OTP is missing in ${role}'s Database`,
        success: false,
      });
    }
    const realOtp = await Otp.findById(user.otp);
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
      user.email.verified = true;
      await user.save();
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
    if (!AdminRole.includes(role) || !mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid);
    } else if (role === "Partner") {
      user = await Partner.findById(uid);
    } else if (role === "Employee") {
      user = await Employee.findById(uid);
    } else {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're unauthorised of this action.",
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No User found with the given Object ID",
        success: false,
      });
    }
  
    if (updatedEmail && user.email.value !== updatedEmail) {
      user.email.value = updatedEmail;
      user.email.verified = false;
    }
    if (user.email.verified === true) {
      return res.status(resType.OK.code).json({
        message: `Email already verified fot this user.`,
        success: false,
      });
    }
    const otp = generateOtp();
    const newOtp = new Otp({
      otp,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      generatedAt: new Date(),
    });
    user.otp = newOtp._id;

    await Promise.all([
      user.save(),
      newOtp.save(),
      sendOTPVerificationEmail(user.email.value, otp),
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
