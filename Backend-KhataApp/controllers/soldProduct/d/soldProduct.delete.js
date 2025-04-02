import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";
import {
  Partner,
  Product,
  SoldProduct,
  Owner,
  Employee,
} from "../../../models/index.js";
import resType from "../../../lib/response.js";

export const deleteSoldProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { soldProductId, role, uid } = req.query;
    if (!soldProductId || !role || !AdminRole.includes(role) || !uid) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required credentials are missing.",
        success: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(soldProductId) ||
      !mongoose.Types.ObjectId.isValid(uid)
    ) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the sold product due to incorrect Object ID.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid);
    } else if (role === "Partner") {
      user = await Partner.findOne({
        _id: uid,
        "permissions.product.delete": true,
      });
    } else if (role === "Employee") {
      user = await Employee.findOne({
        _id: uid,
        "permissions.product.delete": true,
      });
    }
    if (!user) {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You are unauthorised for selling products.",
        success: false,
      });
    }
    const foundSoldProduct = await SoldProduct.findById(soldProductId).populate(
      { path: "product" }
    );
    if (!foundSoldProduct) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the sold product.",
        success: false,
      });
    }
    let product;
    if (
      foundSoldProduct.product &&
      foundSoldProduct.product._id &&
      mongoose.Types.ObjectId.isValid(foundSoldProduct.product._id)
    ) {
      product = await Product.findById(foundSoldProduct.product._id).session(
        session
      );
    } else {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the related product.",
        success: false,
      });
    }

    if (!product) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the related product.",
        success: false,
      });
    }

    product.totalSold -= foundSoldProduct.count;
    product.stock += foundSoldProduct.count;

    await Promise.all([
      product.save({ session }),
      foundSoldProduct.deleteOne({ session }),
    ]);
    await session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "Sold product reversed!",
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Error occurred!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  } finally {
    session.endSession();
  }
};
