import { Schema, model } from "mongoose";
import {sharedUser} from "../Shared/shared.user.js";
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
    partnerId: {
      type: String,
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
  },
  { timestamps: true }
);
const Partner = model("Partner", partnerSchema);
export default Partner;
