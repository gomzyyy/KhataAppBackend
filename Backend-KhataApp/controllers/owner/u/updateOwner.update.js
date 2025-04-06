import { Owner } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import { AdminRole, BusinessType } from "../../../constants/enums.js";
import mongoose from "mongoose";
import { encryptPassword } from "../../../helpers/auth.helper.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../../service/cloud.js";

export const updateOwnerController = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false;
  session.startTransaction();
  try {
    const { uid, role } = req.query;
    let imagePath = req.file?.path;

    const {
      name,
      phoneNumber,
      password,
      email,
      ownerId,
      address,
      businessAddress,
      businessName,
      businessPhoneNumber,
      businessDescription,
      businessType,
      gstNumber,
    } = req.body;

    if (
      !name &&
      !email &&
      !ownerId &&
      !businessAddress &&
      !phoneNumber &&
      !businessPhoneNumber &&
      !businessName &&
      !password &&
      !address &&
      !businessDescription &&
      !businessType &&
      !gstNumber
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "No updated data provided!",
        success: false,
      });
    }

    if (!role || !AdminRole.includes(role) || role !== "Owner" || !uid) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're not authorised for this action.",
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object ID",
        success: false,
      });
    }

    const owner = await Owner.findById(uid).session(session);
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Cannot find owner.",
        success: false,
      });
    }

    let encryptedPassword;
    if (password) {
      encryptedPassword = await encryptPassword(password);
    }

    let prevImage = owner.image;
    let image;

    if (imagePath) {
      const result = await uploadToCloudinary({
        path: imagePath,
        resourceType: "IMAGE",
      });

      if (
        !result ||
        !result.code ||
        result.code !== resType.OK.code ||
        !result.url?.trim()
      ) {
        throw new Error("Error occurred while updating image.");
      }

      image = result.url;
    }
    if (name) owner.name = name;
    if (email) owner.email = email;
    if (ownerId) owner.ownerId = ownerId;
    if (address) owner.address = address;
    if (phoneNumber) owner.phoneNumber = phoneNumber;
    if (password && encryptedPassword) owner.password = encryptedPassword;
    if (businessAddress) owner.businessAddress = businessAddress;
    if (businessPhoneNumber) owner.businessPhoneNumber = businessPhoneNumber;
    if (businessName) owner.businessName = businessName;
    if (businessDescription) owner.businessDescription = businessDescription;
    if (businessType && BusinessType.includes(businessType)) {
      owner.businessType = businessType;
    }
    if (gstNumber) owner.gstNumber = gstNumber;
    if (image) owner.image = image;

    if (image && prevImage) {
      const { code, message } = await deleteFromCloudinary(prevImage);
      if (code !== resType.OK.code) {
        throw new Error(message || "Error deleting previous image.");
      }
    }

    await owner.save({ session });
    await session.commitTransaction();
    transactionCommitted = true;

    return res.status(resType.OK.code).json({
      message: "Owner updated successfully.",
      success: true,
      data: owner,
    });
  } catch (error) {
    if (!transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }
    console.error(error);
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message:
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message,
      success: false,
    });
  } finally {
    await session.endSession();
  }
};
