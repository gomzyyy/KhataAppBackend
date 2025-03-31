import { Schema, model } from "mongoose";
import { sharedProduct } from "../Shared/shared.product.js";

const soldProductSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const SoldProduct = model("SoldProduct", soldProductSchema);
export default SoldProduct;
