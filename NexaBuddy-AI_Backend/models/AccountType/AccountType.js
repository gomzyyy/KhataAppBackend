import { Schema, model } from "mongoose";
import { AccountTypeEnum, connectedWithType } from "../../constants/enums.js";

export const accountTypeModel = new Schema(
  {
    type: {
      type: String,
      enum: [...AccountTypeEnum],
      default: "Regular",
    },
    connectedWith: {
      type: Schema.Types.ObjectId,
      refPath: "connectedWithType",
      required: true,
    },
    connectedWithType: {
      type: String,
      enum: [...connectedWithType],
      requred: true,
    },
    expiresAt: {
      type: Date,
    },
    initialisedAt: {
      type: Date,
    },
    renewalCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const AccountType = model("AccountType", accountTypeModel);
export default AccountType;
