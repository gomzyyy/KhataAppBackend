import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import { AssetType, AssetStatus } from "../../constants/enums.js";

const assetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tangible: {
      type: Boolean,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    categoryDescription: {
      type: String,
    },
    value: {
      type: Number,
      required: true,
    },
    acquiredDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    assetType: {
      type: String,
      enum: [...AssetType],
      required: true,
    },
    appreciatingRate: {
      type: Number,
      default: 0,
    },
    depreciationRate: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
    },
    location: {
      type: String,
    },
    warrantyExpiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [...AssetStatus],
      default: "Active",
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
    },
  },
  { timestamps: true }
);

assetSchema.pre("save", function (next) {
  const yearsPassed =
    (new Date() - this.acquiredDate) / (1000 * 60 * 60 * 24 * 365);

  if (this.assetType === "Appreciating" && this.appreciatingRate) {
    this.currentValue =
      this.value * Math.pow(1 + this.appreciatingRate / 100, yearsPassed);
  } else if (this.assetType === "Depreciating" && this.depreciationRate) {
    this.currentValue =
      this.value * Math.pow(1 - this.depreciationRate / 100, yearsPassed);
  } else {
    this.currentValue = this.value;
  }
  next();
});
const Asset = model("Asset", assetSchema);
export default Asset;
