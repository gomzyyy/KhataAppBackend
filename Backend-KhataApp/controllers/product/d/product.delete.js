import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";
import { Partner, Product, Owner, Employee } from "../../../models/index.js";
import resType from "../../../lib/response.js";

export const deleteProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, role, uid } = req.query;
    if (!productId || !role || !AdminRole.includes(role) || !uid) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required credentials are missing.",
        success: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(uid)
    ) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Can't find the product due to incorrect Object ID.",
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
    const product = await Product.deleteOne(productId).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the related product.",
        success: false,
      });
    }
    await session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "Product deleted.",
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
