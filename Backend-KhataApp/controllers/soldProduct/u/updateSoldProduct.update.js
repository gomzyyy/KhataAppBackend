import {
  SoldProduct,
  Owner,
  Employee,
  Partner,
  Product,
} from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";
import {
  AdminRole,
  CountActionType,
  PaymentState,
} from "../../../constants/enums.js";

export const updateSoldProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { role, uid, soldProductId } = req.query;
    const { count, state } = req.body;

    if (!count && !state) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "No updates provided!",
        success: false,
      });
    }
    if (!CountActionType.includes(count) || !PaymentState.includes(state)) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid update syntax.",
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(uid) || !AdminRole.includes(role)) {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You're not authorised for this action",
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(soldProductId)) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Sold Product Object ID.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid);
    } else if (role === "Partner") {
      user = await Partner.findOne({
        userId: uid,
        "permissions.soldProduct.update": true,
      });
    } else if (role === "Employee") {
      user = await Employee.findOne({
        userId: uid,
        "permissions.soldProduct.update": true,
      });
    } else {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid Role",
        success: false,
      });
    }
    if (!user) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "No user found with the given Object ID",
        success: false,
      });
    }
    const soldProduct = await SoldProduct.findById(soldProductId).session(
      session
    );
    if (!soldProduct || !soldProduct.product._id) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Cannot find sold product with the given Object ID",
        success: false,
      });
    }
    const productRelatedToSoldProduct = await Product.findById(
      soldProduct.product._id
    ).session(session);
    if (!productRelatedToSoldProduct) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "No related product found with the given sold product.",
        success: false,
      });
    }
    if (count === "MINUS") {
      soldProduct.count -= 1;
      productRelatedToSoldProduct.totalSold += 1;
    } else if (count === "ADD") {
      soldProduct.count += 1;
      productRelatedToSoldProduct.totalSold -= 1;
    }
    if (state && SoldProductState.includes(state)) {
      soldProduct.state = state;
    }
    if (count === null && !state) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "No valid update instruction provided.",
        success: false,
      });
    }
    await Promise.all([
      soldProduct.save({ session }),
      productRelatedToSoldProduct.save({ session }),
    ]);
    await session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "Updated successfully",
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
  } finally {
    await session.endSession();
  }
};
