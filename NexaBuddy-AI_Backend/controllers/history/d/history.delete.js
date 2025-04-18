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

export const disableSoldProductHistoryController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
      !CreatedByModel.includes(createdBy) ||
      paymentType !== "SoldProductPaymentHistory"
    ) {
      throw new Error("Invalid Payment or creator reference");
    }

    let soldProductHistory;

    if (paymentType === "SoldProductPaymentHistory") {
      soldProductHistory = await SoldProductPaymentHistory.findById(
        paymentId
      ).session(session);
    }
    if (!soldProductHistory) {
      throw new Error("Unable to find respective hostory in database.");
    }
    soldProductHistory.disabled = true;
    await soldProductHistory.save({ session });
    await session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "History found.",
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
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