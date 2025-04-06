import { Schema, model } from "mongoose";
import { PaymentState, UnkownPaymentType } from "../../../constants/enums.js";

const unknownPaymentHistorySchema = new Schema(
  {
    type: {
      type: String,
      enum: [...UnkownPaymentType],
      default: "CREDIT",
    },

    paymentDescription: {
      type: String,
      required: true,
    },
    details: {
      to: {
        name: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        address: {
          type: String,
        },
        email: {
          type: String,
        },
      },
      from: {
        name: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        address: {
          type: String,
        },
        email: {
          type: String,
        },
      },
      paymentInfo: {
        items: [
          {
            name: {
              type: String,
            },
            price: {
              type: Number,
            },
            quantity: {
              type: Number,
            },
          },
        ],
      },
    },
    state: {
      type: String,
      enum: [...PaymentState],
      default: "UNPAID",
    },
  },
  { timestamps: true }
);
const UnknownPaymentHistory = model(
  "UnknownPaymentHistory",
  unknownPaymentHistorySchema
);
export default UnknownPaymentHistory;
