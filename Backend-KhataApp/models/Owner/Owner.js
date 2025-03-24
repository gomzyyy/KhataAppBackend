import { Schema, model } from "mongoose";
import Shared from "../shared.js";
import { AdminRole, BusinessType } from "../../constants/enums";

const ownerSchema = new Schema(
  {
    ...Shared,
    password: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    businessAddress: {
      type: String,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessPartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "Owner",
      },
    ],
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
