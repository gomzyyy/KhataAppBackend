import { Schema, model } from "mongoose";
import { sharedProduct } from "../Shared/shared.product.js";
import { CreatedByModel } from "../../constants/enums.js";

const productSchema = new Schema(
  {
    ...sharedProduct,
    createdBy: {
      type: Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },
    createdByModel: {
      type: String,
      required: true,
      enum: [...CreatedByModel],
    },
  },
  { timestamps: true }
);
const Product = model("Product", productSchema);
export default Product;
