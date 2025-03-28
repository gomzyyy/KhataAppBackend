import { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";
import { AdminRole, BusinessType, PremiumType } from "../../constants/enums.js";

const ownerSchema = new Schema(
  {
    ...sharedUser,
    password: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      unique: true,
      required: true,
    },
    businessAddress: {
      type: String,
      required: true,
    },
    equity: {
      type: Number,
      required: true,
    },
    businessName: {
      type: String,
      unique: true,
      required: true,
    },
    businessPhoneNumber: {
      type: String,
      required: true,
    },
    businessPartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "Owner",
      },
    ],
    gstNumber: {
      type: String,
    },
    premium: {
      type: String,
      enum: [...PremiumType],
      default: "Regular",
    },
    businessDescription: {
      type: String,
    },
    businessType: {
      type: String,
      enum: [...BusinessType],
      required: true,
    },
    EmployeeData: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    customers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    role: {
      type: String,
      enum: [...AdminRole],
      required: true,
    },
    assets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    liabilities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Liability",
      },
    ],
    sessionId: {
      type: Number,
    },
    accessPasscode: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);
const Owner = model("Owner", ownerSchema);
export default Owner;
