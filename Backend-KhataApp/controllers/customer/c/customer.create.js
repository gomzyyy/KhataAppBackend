import { CreatedByModel } from "../../../constants/enums.js";
import { Customer, Employee, Owner, Partner } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";

export const createCustomerController = async (req, res) => {
  try {
    const { creatorId, createdBy } = req.query;
    const { name, address, businessOwnerId, phoneNumber, image, email } =
      req.body;

    if (!name || !address || !businessOwnerId) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }
    if (!creatorId || !createdBy || !CreatedByModel.includes(createdBy)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "You are not authorised of this action.",
        success: false,
      });
    }

    let existingCustomer;
    if (phoneNumber) {
      existingCustomer = await Customer.findOne({ phoneNumber });
    } else {
      existingCustomer = await Customer.findOne({ name });
    }
    if (existingCustomer) {
      return res.status(resType.CONFLICT.code).json({
        message: "Customer already exists with the given credentials",
        success: false,
      });
    }

    let creator;
    if (mongoose.Types.ObjectId.isValid(creatorId)) {
      if (createdBy === "Partner") {
        creator = await Partner.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })?.select("-password");
      } else if (createdBy === "Employee") {
        creator = await Employee.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })?.select("-password");
      } else {
        creator = await Owner.findById(creatorId);
      }
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
        success: false,
      });
    }

    if (!creator) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "You are not an Authorised user to perform this action",
        success: false,
      });
    }

    let foundBusinessOwner;
    if (mongoose.Types.ObjectId.isValid(businessOwnerId)) {
      foundBusinessOwner = await Owner.findById(businessOwnerId).select(
        "-password"
      );
      if (!foundBusinessOwner) {
        return res.status(resType.NOT_FOUND.code).json({
          message: "No owner found or Incorrect Owner ID",
          success: false,
        });
      }
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Owner Object ID.",
        success: false,
      });
    }
    const newCustomerObj = {
      name,
      phoneNumber: phoneNumber || undefined,
      image: image || undefined,
      email: email || undefined,
      businessOwner: foundBusinessOwner._id,
      unpaidPayments: [],
      paidPayments: [],
      createdBy: creator._id,
      createdByModel: createdBy,
    };
    const newCustomer = new Customer(newCustomerObj);
    await newCustomer.save();
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
  }
};
