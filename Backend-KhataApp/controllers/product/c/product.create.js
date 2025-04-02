import { Employee, Owner, Partner, Product } from "../../../models/index.js";
import { CreatedByModel, MeasurementType } from "../../../constants/enums.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";

export const createProductController = async (req, res) => {
  try {
    const { creatorId, role } = req.query;
    const {
      name,
      image,
      basePrice,
      discountedPrice,
      quantity,
      measurementType,
      measurementTypeDescription,
      stock,
      productCost,
    } = req.body;

    if (
      !name ||
      !basePrice ||
      !quantity ||
      !measurementType ||
      !MeasurementType.includes(measurementType) ||
      (measurementType === "Other" && !measurementTypeDescription) ||
      !stock ||
      !productCost ||
      !creatorId ||
      !role ||
      !CreatedByModel.includes(role)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing.",
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
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

    const newProductData = {
      name,
      image: image || undefined,
      totalSold: 0,
      basePrice,
      discountedPrice: discountedPrice || undefined,
      quantity,
      measurementType: measurementType || undefined,
      measurementTypeDescription: measurementTypeDescription || undefined,
      stock,
      productCost,
      createdBy: creator._id,
      createdByModel: role,
    };

    const newProduct = new Product(newProductData);
    await newProduct.save();

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
