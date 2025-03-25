import { Quantity } from "../../constants/enums.js";

export const sharedProduct = {
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
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
    type: string,
  },
  stock: {
    type: Number,
    required: true,
  },
  productCost: {
    type: Number,
    required: true,
  },
};
