import mongoose from "mongoose";
import { resType } from "../../../lib/response.js";
import {
  CreatedByModel,
  PaymentHistoryType,
} from "../../../constants/enums.js";
import {
  SoldProductPaymentHistory,
  UnknownPaymentHistory,
} from "../../../models/index.js";

export const getSingleHistoryController = async (req, res) => {
  try {
    const { paymentType, paymentId, creatorId, createdBy } = req.query;
    if (!paymentId || !paymentType || !creatorId || !createdBy) {
      throw new Error("Some required queries are missing!");
    }
    if (
      !mongoose.Types.ObjectId.isValid(paymentId) ||
      !mongoose.Types.ObjectId.isValid(creatorId)
    ) {
      throw new Error("Invalid Object ID!");
    }
    if (
      !PaymentHistoryType.includes(paymentType) ||
      !CreatedByModel.includes(createdBy)
    ) {
      throw new Error("Invalid Payment or creator reference");
    }

    let paymentDetails;

    if (paymentType === "SoldProductPaymentHistory") {
      paymentDetails = await SoldProductPaymentHistory.findById(
        paymentId
      ).populate({
        path: "reference",
        populate: [{ path: "buyer" }, { path: "soldBy" }],
      });
    } else if (paymentType === "UnknownPaymentHistory") {
      paymentDetails = await UnknownPaymentHistory.findById(paymentId);
    }
    if (!paymentDetails) {
      throw new Error("Unable to find respective hostory in database.");
    }

    return res.status(resType.OK.code).json({
      message: "History found.",
      success: true,
      data: {
        paymentDetails,
      },
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  }
};
