import { Schema, model } from "mongoose";
import {
  PaymentHistoryReferenceType,
  PaymentState,
} from "../../../constants/enums.js";

const soldProductPaymentHistorySchema = new Schema(
  {
    referenceType: {
      type: String,
      enum: [...PaymentHistoryReferenceType],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceType",
      required: true,
    },
    paymentDescription: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: [...PaymentState],
      default: "UNPAID",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const SoldProductPaymentHistory = model(
  "SoldProductPaymentHistory",
  soldProductPaymentHistorySchema
);
export default SoldProductPaymentHistory;
