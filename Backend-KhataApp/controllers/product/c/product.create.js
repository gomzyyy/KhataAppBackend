import { Product } from "../../../models/index.js";
import { CreatedByModel } from "../../../constants/enums.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";

export const createProductController = async (req, res) => {
  try {
    const { creatorId, createdBy } = req.query;
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
      !stock ||
      !productCost ||
      !creatorId ||
      !createdBy ||
      !CreatedByModel.includes(createdBy)
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
      createdBy: creatorId,
      createdByModel: createdBy,
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
