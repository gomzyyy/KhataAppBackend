import { resType } from "../../lib/response.js";
import { Owner, Partner, Employee } from "../../models/index.js";
import {
  encryptPassword,
  generateToken,
  verifyPassword,
} from "../../helpers/auth.helper.js";
import { AdminRole, BusinessType } from "../../constants/enums.js";

export const loginController = async (req, res) => {
  try {
    console.log("ueruireiu");
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
      user = await Owner.findOne({ ownerId: userId });
    } else if (role === "Partner") {
      user = await Partner.findOne({ partnerId: userId });
    } else if (role === "Employee") {
      user = await Employee.findOne({ employeeId: userId });
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
      console.log(error);
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Token generation failed",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Login success.",
      data: {
        user,
        token,
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
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
      ownerId, //
      businessAddress, //
      businessName, //
      businessPhoneNumber, //
      businessDescription,
      businessType, //
      role,
      equity,
      gstNumber,
    } = req.body;
    console.log(
      name,
      email,
      ownerId,
      businessAddress,
      businessPhoneNumber,
      businessType,
      businessName,
      password,
      role,
      equity,
      gstNumber
    );
    if (
      !name ||
      !email ||
      !ownerId ||
      !businessAddress ||
      (!businessType && !BusinessType.includes(businessType)) ||
      !businessPhoneNumber ||
      !businessName ||
      !password ||
      (!role && !AdminRole.includes(role)) ||
      !equity
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
      Owner.findOne({ ownerId }),
      Owner.findOne({ businessName }),
      Owner.findOne({ businessPhoneNumber }),
    ]);

    if (
      existingOwnerById ||
      existingOwnerByBusinessName ||
      existingOwnerByPhoneNumber.businessName.toLowerCase() === businessName
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message:
          "Credientials already in use:'ID', 'Business Name', 'Business Phone Number'",
        success: false,
      });
    }

    const encryptedPassword = await encryptPassword(password);
    if (!encryptedPassword) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Error occured while encrypting user credientials",
        success: false,
      });
    }

    const newOwnerData = {
      name,
      phoneNumber: phoneNumber || null,
      email,
      address: address || null,
      ownerId,
      password: encryptedPassword,
      businessAddress,
      businessName,
      businessPhoneNumber,
      businessDescription: businessDescription || null,
      businessType,
      role,
      equity,
      gstNumber,
    };
    const newBusinessOwner = new Owner(newOwnerData);
    await newBusinessOwner.save();
    return res.status(resType.OK.code).json({
      message: "Signup success",
      data: {
        user: newBusinessOwner,
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
