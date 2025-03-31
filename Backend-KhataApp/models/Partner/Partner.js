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
    partnerId: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: [...AdminRole],
      required: true,
    },
    sessionId: {
      type: Number,
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
