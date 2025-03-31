import { SoldProduct, Product, Customer } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";

export const createSoldProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { buyerId } = req.query;
    const { productId, count } = req.body;

    if (!productId || !buyerId || !count) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing.",
        success: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(buyerId)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object ID for product or buyer.",
        success: false,
      });
    }
    const product = await Product.findById(productId).session(session);
    if (!product || product.stock < count) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Product not found or insufficient stock.",
        success: false,
      });
    }
    const buyer = await Customer.findById(buyerId).session(session);
    if (!buyer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Buyer not found.",
        success: false,
      });
    }
    const newSoldProduct = new SoldProduct({
      product: product._id,
      buyer: buyer._id,
      count,
    });

    await newSoldProduct.save({ session });

    product.stock -= count;
    product.totalSold += count;
    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(resType.OK.code).json({
      message: "Product sold successfully!",
      data: { soldProduct: newSoldProduct },
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
