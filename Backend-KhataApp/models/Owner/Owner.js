import mongoose, { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";
import {
  AdminRole,
  BusinessType,
  CreatedByModel,
  PremiumType,
} from "../../constants/enums.js";

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
    otp: {
      type: Schema.Types.ObjectId,
      ref: "Otp",
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
        ref: "Partner",
      },
    ],
    gstNumber: {
      type: String,
    },
    accountType: {
      type: Schema.Types.ObjectId,
      ref: "AccountType",
    },
    history: {
      payments: [
        {
          payment: {
            type: Schema.Types.ObjectId,
            refPath: "paymentType",
          },
          paymentType: {
            type: String,
            enum: ["SoldProductPaymentHistory", "UnknownPaymentHistory"],
          },
          createdAt: Date,
          createdBy: {
            type: Schema.Types.ObjectId,
            refPath: "paymentType",
          },
          createdByModel: {
            type: String,
            enum: [...CreatedByModel],
          },
        },
      ],
    },
    properties: {
      searchable: {
        type: Boolean,
        default: true,
      },
      isDisabled: {
        type: Boolean,
        default: false,
      },
      accessBusinessInfo: {
        type: Boolean,
        default: true,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      partnerSearchable: {
        type: Boolean,
        default: true,
      },
      employeeSearchable: {
        type: Boolean,
        default: true,
      },
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
    inventory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
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
