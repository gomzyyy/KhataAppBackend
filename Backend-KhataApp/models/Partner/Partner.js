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
      canCreateCustomer: {
        type: Boolean,
        default: true,
      },
      canEditCustomer: {
        type: Boolean,
        default: true,
      },
      canCreateEmployee: {
        type: Boolean,
        default: true,
      },
      canEditEmployee: {
        type: Boolean,
        default: true,
      },
      canSeeAnalytics: {
        type: Boolean,
        default: true,
      },
      canSeeDocs: {
        assets: {
          type: Boolean,
          default: true,
        },
        liabilities: {
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
