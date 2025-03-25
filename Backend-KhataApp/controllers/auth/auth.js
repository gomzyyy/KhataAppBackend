import { AdminRole } from "../../constants/enums.js";
import { resType } from "../../lib/response.js";
import { Owner, Employee, Partner } from "../../models/index.js";
import {
  encryptPassword,
  generateToken,
  verifyPassword,
} from "../../helpers/auth.helper.js";

export const loginController = async (req, res) => {
  try {
    const { loginAs, uid } = req.query; //uid === userId #Owner or #Partner
    const { password } = req.body;
    if (
      !uid ||
      !loginAs ||
      !AdminRole.includes(loginAs) ||
      loginAs === "Employee" ||
      !password
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    const modelMap = {
      Owner: Owner,
      Partner: Partner,
    };

    const userModel = modelMap[loginAs];

    if (!userModel) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid login type",
        success: false,
      });
    }
    const idFieldMap = {
      Owner: "ownerId",
      Partner: "partnerId",
    };

    const idField = idFieldMap[loginAs];
    const user = await userModel.findOne({ [idField]: uid });
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: resType.NOT_FOUND.message,
        success: false,
      });
    }
    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: resType.UNAUTHORIZED.message,
        success: false,
      });
    }
    let token;
    try {
      token = generateToken({ UID: user[idField] });
    } catch (error) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Token generation failed",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: resType.OK.message,
      data: {
        user,
        token,
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Error occurred!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  }
};

export const employeeLoginController = async (req, res) => {
  try {
    const { employeeData, oid } = req.query; //oid === ownerId #Owner
    if (!employeeData || !oid) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    const owner = await Owner.findOne({ ownerId: oid })
      .populate({ path: "EmployeeData", match: { status: "Active" } })
      .select("-password");

    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Owner not found with the given ID",
        success: false,
      });
    }
    if (!employeeData.name) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Employee name is required",
        success: false,
      });
    }
    const employee = owner.EmployeeData.find(
      (s) => s.name.toLowerCase() === employeeData.name.toLowerCase()
    );
    if (!employee) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No registered Employee found with the given ID",
        success: false,
      });
    }
    let token;
    try {
      token = generateToken({ employee });
    } catch (error) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Token generation failed",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Login success",
      data: {
        user: employee,
        token,
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Error occurred!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
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
    } = req.body;
    if (
      !name ||
      !email ||
      !ownerId ||
      !businessAddress ||
      !businessType ||
      !businessPhoneNumber ||
      !businessName ||
      !password
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }
    const [existingOwnerById, existingOwnerByBusinessName] = await Promise.all([
      Owner.findOne({ ownerId }),
      Owner.findOne({ businessName }),
    ]);

    if (existingOwnerById || existingOwnerByBusinessName) {
      return res.status(resType.BAD_REQUEST.code).json({
        message:
          existingOwnerById && existingOwnerByBusinessName
            ? "The owner ID and business name are already in use"
            : existingOwnerById
            ? "The owner ID is already used by someone"
            : "The business name is already acquired by another firm",
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
