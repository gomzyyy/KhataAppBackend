import { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";
import {CreatedByModel} from "../../constants/enums.js"

const customerSchema = new Schema(
  {
    name:{
      type:String,
      required:true
    },
    address:{
      type:String,
      required:true
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    unpaidPayments: [{ type: Schema.Types.ObjectId, ref: "SoldProduct" }],
    paidPayments: [{ type: Schema.Types.ObjectId, ref: "SoldProduct" }],
    createdBy:{
      type:Schema.Types.ObjectId,
      refPath:"createdByModel",
      required:true
    },
    createdByModel:{
type:String,
required:true,
enum:[...CreatedByModel]
    }
  },
  { timestamps: true }
);
const Customer = model("Customer", customerSchema);
export default Customer;
