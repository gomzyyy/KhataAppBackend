import { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";
import { AdminRole } from "../../constants/enums.js";

const partnerSchema = new Schema(
  {
    ...sharedUser,
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
    },
    password: {
      type: String,
      required: true,
    },
    equity: {
      type: Number,
      required: true,
    },
    otp: {
      type: Schema.Types.ObjectId,
      ref: "Otp",
    },
    role: {
      type: String,
      enum: [...AdminRole],
      required: true,
    },
    accessPasscode: [
      {
        type: String,
      },
    ],
    permissions: {
      customer: {
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      employee: {
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      product:{
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      soldProduct:{
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      docs: {
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      analytics: {
        accessable: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  { timestamps: true }
);
const Partner = model("Partner", partnerSchema);
export default Partner;
