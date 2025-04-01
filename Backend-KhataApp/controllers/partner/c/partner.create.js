import { AdminRole } from "../../../constants/enums.js";
import { Owner, Partner } from "../../../models/index.js";
import { encryptPassword } from "../../../helpers/auth.helper.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";

export const createPartnerController = async (req, res) => {
  try {
    const { creatorId, createdBy } = req.query;
    const {
      name, //
      image,
      phoneNumber, //
      password, //
      role, //
      email, //
      address,
      businessOwnerId, //
      equity, //
      partnerId,
    } = req.body;

    if (
      !businessOwnerId ||
      !name ||
      !email ||
      !role ||
      !password ||
      !equity ||
      !partnerId ||
      !phoneNumber ||
      !address
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid/insufficient Entries.",
        success: false,
      });
    }
    if (!AdminRole.includes(role) || createdBy !== "Owner") {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid/Unauthorised role",
        success: false,
      });
    }

    const existingPartner = await Partner.findOne({
      $or: [{ partnerId }, { email }, { phoneNumber }],
    });
    if (existingPartner) {
      return res.status(resType.CONFLICT.code).json({
        message: "Partner ID, email, or phone number already exists.",
        success: false,
      });
    }

    if (!creatorId || !createdBy) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Unauthorised action!",
        success: false,
      });
    }

    let owner;
    if (mongoose.Types.ObjectId.isValid(businessOwnerId)) {
      owner = await Owner.findById(businessOwnerId);
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
        success: false,
      });
    }
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "You are not an Authorised user to perform this action",
        success: false,
      });
    }

    if (creatorId !== owner._id.toString()) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid business owner ID.",
        success: false,
      });
    }
    if (
      email === owner.email ||
      phoneNumber === owner.phoneNumber ||
      role === "Owner" ||
      equity === 100 ||
      equity > owner.equity ||
      (owner.equity !== 50 && equity === owner.equity)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid entries.",
        success: false,
      });
    }

    const encryptedPassword = await encryptPassword(password);
    if (!encryptedPassword) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Error occured while encrypting user credentials",
        success: false,
      });
    }

    const newPartnerData = {
      name,
      image: image || undefined,
      phoneNumber,
      password: encryptedPassword,
      role,
      email,
      address,
      businessOwner: owner._id,
      equity,
      partnerId,
    };

    const newPartner = new Partner(newPartnerData);
    await newPartner.save();
    owner.equity -= equity;
    await owner.save();
    return res.status(resType.OK.code).json({
      message: "Signup success",
      data: {
        user: newPartner,
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
