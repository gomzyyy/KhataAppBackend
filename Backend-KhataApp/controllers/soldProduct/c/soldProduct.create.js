import {
  SoldProduct,
  Product,
  Customer,
  Owner,
  Employee,
  Partner
} from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";

export const createSoldProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { buyerId, role, sellerId } = req.query;
    const { productId, count } = req.body;

    if (
      !productId ||
      !buyerId ||
      !count ||
      !AdminRole.includes(role) ||
      !sellerId
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing.",
        success: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(sellerId)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object ID for product or buyer.",
        success: false,
      });
    }
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Can't find the product",
        success: false,
      });
    }

if( product.stock === 0 ||product.stock < count){
  await session.abortTransaction();
  session.endSession();
  return res.status(resType.UNPROCESSABLE_ENTITY.code).json({
    message: "Insufficient stocks.",
    success: false,
  }); 
}

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alreadySold = await SoldProduct.findOne({
      product: productId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    if (alreadySold) {
      alreadySold.count += count;
      product.stock -= count;
      product.totalSold += count;
      await Promise.all([
        product.save({ session }),
        alreadySold.save({ session }),
      ]);
      await session.commitTransaction();
      session.endSession();

      return res.status(resType.OK.code).json({
        message: "Product sold successfully!",
        data: { soldProduct: alreadySold},
        success: true,
      });
    }
    let seller;
    if (role === "Owner") {
      seller = await Owner.findById(sellerId);
    } else if (role === "Partner") {
      seller = await Partner.findOne({
        _id: sellerId,
        "permissions.product.create": true,
      });
    } else if (role === "Employee") {
      seller = await Employee.findOne({
        _id: sellerId,
        "permissions.product.create": true,
      });
    }
    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You are unauthorised for selling products.",
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
      soldBy: seller._id,
      soldByModel: role,
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
