import { resType } from "../../lib/response.js";
import { Owner, Partner, Employee, AccountType } from "../../models/index.js";
import {
  encryptPassword,
  generateReferralCode,
  generateToken,
  verifyPassword,
} from "../../helpers/auth.helper.js";
import { AdminRole, BusinessType } from "../../constants/enums.js";
import { uploadToCloudinary } from "../../service/cloud.js";
import mongoose from "mongoose";
import { populate_obj } from "../../helpers/obj.js";

export const loginController = async (req, res) => {
  try {
    const { role } = req.query;
    const { userId, password } = req.body;
    if (!password || !userId || !role || !AdminRole.includes(role)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }

    let user;

    if (role === "Owner") {
      user = await Owner.findOne({ userId }).populate(populate_obj[role]);
    } else if (role === "Partner") {
      user = await Partner.findOne({ userId }).populate(populate_obj[role]);
    } else if (role === "Employee") {
      user = await Employee.findOne({ userId }).populate(populate_obj[role]);
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "User not found with the given ID",
        success: false,
      });
    }
    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid password.",
        success: false,
      });
    }
    let token;
    try {
      token = generateToken({ UID: user._id });
    } catch (error) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Token generation failed",
        success: false,
      });
    }
    if (!token) {
      return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
        message: "Token generation error.",
        data: {
          user: undefined,
          token: undefined,
        },
        success: true,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Login success.",
      data: {
        user,
        token,
        sessionId: Date.now(),
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Internal server error.`,
      success: false,
    });
  }
};

export const signupController = async (req, res) => {
  try {
    const {
      name, //
      phoneNumber,
      password, //
      email, //
      address,
      userId, //
      businessAddress, //
      businessName, //
      businessPhoneNumber, //
      businessDescription,
      businessType, //
      role,
      gstNumber,
      uniqueReferralCode,
    } = req.body;
    if (
      !name || //
      !email || //
      !userId || //
      !businessAddress || //
      !businessType || //
      !BusinessType.includes(businessType) ||
      !businessPhoneNumber ||
      !businessName ||
      !password ||
      !role ||
      !AdminRole.includes(role)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }
    const [
      existingOwnerById,
      existingOwnerByBusinessName,
      existingOwnerByPhoneNumber,
    ] = await Promise.all([
      Owner.findOne({ userId }),
      Owner.findOne({ businessName }),
      Owner.findOne({ "businessPhoneNumber.value": businessPhoneNumber }),
    ]);

    if (
      existingOwnerById ||
      existingOwnerByBusinessName ||
      (existingOwnerByPhoneNumber &&
        existingOwnerByPhoneNumber.businessName.toLowerCase() === businessName)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message:
          "Credentials already in use:'ID', 'Business Name', 'Business Phone Number'",
        success: false,
      });
    }
    let image;
    if (req.file && req.file.path) {
      try {
        const { code, url } = await uploadToCloudinary({
          path: req.file.path,
          resourceType: "IMAGE",
        });
        if (code !== resType.OK.code || !url?.trim()) {
          return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
            message: "Error occurred while uploading image.",
            success: false,
          });
        }
        image = url;
      } catch (error) {
        return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
          message:
            error instanceof Error
              ? error.message
              : resType.INTERNAL_SERVER_ERROR.message,
          success: false,
        });
      }
    }
    const encryptedPassword = await encryptPassword(password);
    if (!encryptedPassword) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Error occurred while encrypting user credentials",
        success: false,
      });
    }

    let refCode;
    let isUnique = false;
    while (!isUnique) {
      refCode = generateReferralCode(userId);
      const existing = await Owner.findOne({ referralCode: refCode });
      if (!existing) isUnique = true;
    }
    if (!refCode) {
      return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
        message: "Referral code generation failed.",
        success: false,
      });
    }

    const newOwnerData = {
      name,
      phoneNumber: {
        value: phoneNumber || undefined,
        verified: false,
      },
      email: {
        value: email,
        verified: false,
      },
      address: address || undefined,
      userId,
      password: encryptedPassword,
      businessAddress,
      businessName,
      businessPhoneNumber: {
        value: businessPhoneNumber,
      },
      businessDescription: businessDescription || undefined,
      businessType,
      role,
      equity: 100,
      gstNumber,
      image,
      referralCode: refCode,
    };
    const newBusinessOwner = new Owner(newOwnerData);
    const newAccountType = new AccountType({
      type: "Regular",
      connectedWithType: "Owner",
      connectedWith: newBusinessOwner._id,
    });
    newBusinessOwner.accountType = newAccountType._id;
    let token;
    try {
      token = generateToken({ UID: newBusinessOwner._id });
    } catch (error) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Token generation failed",
        success: false,
      });
    }
    if (!token) {
      return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
        message: "Token generation error.",
        data: {
          user: undefined,
          token: undefined,
        },
        success: true,
      });
    }
    if (uniqueReferralCode) {
      const referBy = await Owner.findOne({ referralCode: uniqueReferralCode });
      if (!referBy) {
        return res.status(resType.BAD_REQUEST.code).json({
          message: "Incorrect Referral code.",
          data: {
            user: undefined,
            token: undefined,
          },
          success: false,
        });
      }
      referBy.credits += 7;
      newBusinessOwner.credits += 7;
      await referBy.save();
    }
    await Promise.all([newBusinessOwner.save(), newAccountType.save()]);

    return res.status(resType.OK.code).json({
      message: "Signup success",
      data: {
        user: newBusinessOwner,
        token,
      },
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

export const getUpdatedUser = async (req, res) => {
  try {
    const { role } = req.query;
    const uid = req.uid;
    if (!role || !AdminRole.includes(role)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object Id.",
        data: {
          user: undefined,
        },
        success: false,
      });
    }
    let user;

    if (role === "Owner") {
      user = await Owner.findById(uid).populate(populate_obj[role]);
    } else if (role === "Partner") {
      user = await Partner.findById(uid).populate(populate_obj[role]);
    } else if (role === "Employee") {
      user = await Employee.findById(uid).populate(populate_obj[role]);
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "User not found with the given ID",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Login success.",
      data: {
        user,
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Internal server error.`,
      success: false,
    });
  }
};
