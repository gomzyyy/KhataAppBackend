import { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";

const customerSchema = new Schema(
  {
    ...sharedUser,
    customerId: {
      type: String,
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    unpaidPayments: [{ type: Schema.Types.ObjectId, ref: "SoldProduct" }],
    paidPayments: [{ type: Schema.Types.ObjectId, ref: "SoldProduct" }],
  },
  { timestamps: true }
);
const Customer = model("Customer", customerSchema);
export default Customer;
