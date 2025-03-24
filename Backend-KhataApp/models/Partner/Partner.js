import { Schema, model } from "mongoose";
import Shared from "../shared.js";
import { AdminRole } from "../../constants/enums";

const partnerSchema = new Schema(
  {
    ...Shared,
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
const Partner = model("Owner", partnerSchema);
export default Partner;
