import { Schema, model } from "mongoose";
import { sharedProduct } from "../Shared/shared.product.js";

const productSchema = new Schema(
  {...sharedProduct},
  { timestamps: true }
);
const Product = model("Product", productSchema);
export default Product;
