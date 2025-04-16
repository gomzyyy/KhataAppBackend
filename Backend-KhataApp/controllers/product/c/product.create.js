import { Employee, Owner, Partner, Product } from "../../../models/index.js";
import {
  CreatedByModel,
  MeasurementType,
  ProductType,
} from "../../../constants/enums.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../../../service/cloud.js";

export const createProductController = async (req, res) => {
  try {
    const { creatorId, role, ownerId } = req.query;
    const {
      name,
      basePrice,
      discountedPrice,
      quantity,
      measurementType,
      measurementTypeDescription,
      stock,
      productCost,
      productType,
    } = req.body;
    if (
      !name ||
      !basePrice ||
      !quantity ||
      !measurementType ||
      !MeasurementType.includes(measurementType) ||
      (measurementType === "Other" && !measurementTypeDescription) ||
      !stock ||
      !creatorId ||
      !ownerId ||
      !role ||
      !CreatedByModel.includes(role) ||
      !productType ||
      !ProductType.includes(productType)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing.",
        success: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(creatorId) ||
      !mongoose.Types.ObjectId.isValid(ownerId)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
        success: false,
      });
    }

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Cannot find the owner.",
        success: false,
      });
    }
    const existingProduct = await Product.findOne({
      name,
      createdBy: creatorId,
    });

    if (existingProduct) {
      return res.status(resType.CONFLICT.code).json({
        message: "Product with the same name already exists.",
        success: false,
      });
    }
    let creator;
    if (role === "Owner") {
      creator = await Owner.findById(creatorId);
    } else if (role === "Partner") {
      creator = await Partner.findOne({
        _id: creatorId,
        "permissions.product.create": true,
      });
    } else if (role === "Employee") {
      creator = await Employee.findOne({
        _id: creatorId,
        "permissions.product.create": true,
      });
    }

    if (!creator) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "You are not authorised for this action.",
        success: false,
      });
    }
    let imageUrl;
    if (req.file && req.file.path) {
      try {
        const { code, url } = await uploadToCloudinary({
          path: req.file.path,
          resourceType: "IMAGE",
        });
        if (code === resType.OK.code && url) {
          imageUrl = url;
        } else {
          return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
            message: `Error occurred while uploading image.`,
            success: false,
          });
        }
      } catch (error) {
        return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
          message: `Error occurred!: ${
            error instanceof Error
              ? error.message
              : resType.INTERNAL_SERVER_ERROR.message
          }`,
          success: false,
        });
      }
    }

    const newProductData = {
      name,
      image: imageUrl || undefined,
      totalSold: 0,
      businessOwner: owner._id,
      basePrice,
      discountedPrice: discountedPrice || undefined,
      quantity,
      measurementType: measurementType || undefined,
      measurementTypeDescription: measurementTypeDescription || undefined,
      stock,
      productCost: productCost || 0,
      createdBy: creator._id,
      createdByModel: role,
      productType: productType || "Physical",
    };

    const newProduct = new Product(newProductData);
    owner.inventory.push(newProduct._id);

    await Promise.all([newProduct.save(), owner.save()]);
    return res.status(resType.OK.code).json({
      message: "Product created successfully!",
      data: {
        product: newProduct,
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Error occurred!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  }
};
