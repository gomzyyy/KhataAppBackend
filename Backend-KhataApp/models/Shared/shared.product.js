import { CreatedByModel, Quantity } from "../../constants/enums.js";
import { Schema } from "mongoose";

export const sharedProduct = {
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  totalSold: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
  },
  measurementType: {
    type: String,
    enum: [...Quantity],
  },
  measurementTypeDescription: {
    type: String,
  },
  stock: {
    type: Number,
    required: true,
  },
  productCost: {
    type: Number,
    required: true,
  },
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
};
