import { CreatedByModel } from "../../../constants/enums.js";
import { Customer, Employee, Owner, Partner } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../../../service/cloud.js";

export const createCustomerController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { creatorId, createdBy } = req.query;
    const { name, address, businessOwnerId, phoneNumber, email } = req.body;

    if (!name || !businessOwnerId) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }
    if (!creatorId || !createdBy || !CreatedByModel.includes(createdBy)) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "You are not authorized to perform this action.",
        success: false,
      });
    }

    let existingCustomer;
    if (phoneNumber) {
      existingCustomer = await Customer.findOne({ phoneNumber }).session(
        session
      );
    } else {
      existingCustomer = await Customer.findOne({ name }).session(session);
    }
    if (existingCustomer) {
      await session.abortTransaction();
      return res.status(resType.CONFLICT.code).json({
        message: "Customer already exists with the given credentials",
        success: false,
      });
    }

    if (email) {
      const existingEmail = await Customer.findOne({ email }).session(session);
      if (existingEmail) {
        await session.abortTransaction();
        return res.status(resType.CONFLICT.code).json({
          message: "Customer already exists with the given email",
          success: false,
        });
      }
    }

    let creator;
    if (mongoose.Types.ObjectId.isValid(creatorId)) {
      if (createdBy === "Partner") {
        creator = await Partner.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })
          .select("-password")
          .session(session);
      } else if (createdBy === "Employee") {
        creator = await Employee.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })
          .select("-password")
          .session(session);
      } else {
        creator = await Owner.findById(creatorId).session(session);
      }
    } else {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
        success: false,
      });
    }

    if (!creator) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "You are not an Authorised user to perform this action",
        success: false,
      });
    }

    let foundBusinessOwner;
    if (mongoose.Types.ObjectId.isValid(businessOwnerId)) {
      foundBusinessOwner = await Owner.findById(businessOwnerId)
        .select("-password")
        .session(session);
      if (!foundBusinessOwner) {
        await session.abortTransaction();
        return res.status(resType.NOT_FOUND.code).json({
          message: "No owner found or Incorrect Owner ID",
          success: false,
        });
      }
    } else {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Owner Object ID.",
        success: false,
      });
    }
    let imageUrl;

    if (req.file && req.file.path) {
      const { code, url } = await uploadToCloudinary({
        path: req.file.path,
        resourceType: "IMAGE",
      });
      if (code === resType.OK.code) {
        imageUrl = url;
      }
    }
    const newCustomerObj = {
      name,
      phoneNumber: phoneNumber || undefined,
      image: imageUrl || undefined,
      email: email || undefined,
      businessOwner: foundBusinessOwner._id,
      unpaidPayments: [],
      paidPayments: [],
      createdBy: creator._id,
      createdByModel: createdBy,
      address,
    };
    const newCustomer = new Customer(newCustomerObj);
    foundBusinessOwner.customers.push(newCustomer._id);
    await Promise.all([
      newCustomer.save({ session }),
      foundBusinessOwner.save({ session }),
    ]);
    session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "Customer created successfully!",
      data: {
        customer: newCustomer,
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
  } finally {
    session.endSession();
  }
};
