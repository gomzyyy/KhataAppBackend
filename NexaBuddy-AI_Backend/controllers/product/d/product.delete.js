import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";
import { Partner, Product, Owner, Employee } from "../../../models/index.js";
import resType from "../../../lib/response.js";
import { populate_obj } from "../../../helpers/obj.js";
import { deleteFromCloudinary } from "../../../service/cloud.js";

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
    let owner;
    if (role === "Owner") {
      owner = await Owner.findById(uid)
        .populate(populate_obj[role])
        .session(session);
    } else if (role === "Partner") {
      let partner = await Partner.findOne({
        _id: uid,
        "permissions.product.delete": true,
      })
        .populate(populate_obj[role])
        .session(session);
      if (partner) {
        owner = partner.businessOwner;
      }
    } else if (role === "Employee") {
      let employee = await Employee.findOne({
        _id: uid,
        "permissions.product.delete": true,
      })
        .populate(populate_obj[role])
        .session(session);
      if (employee) {
        owner = employee.businessOwner;
      }
    }
    if (!owner) {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "You are not authorized to delete products.",
        success: false,
      });
    }
    const product = await Product.findById(productId)
      .populate("businessOwner")
      .session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Can't find the related product.",
        success: false,
      });
    }
    if (product.businessOwner._id.toString() !== owner._id.toString()) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "This product doesn't belong to your inventory.",
        success: false,
      });
    }
    if (product.image) {
      const { code, message } = await deleteFromCloudinary(product.image);
      if (code !== resType.OK.code) {
        await session.abortTransaction();
        return res.status(resType.BAD_REQUEST.code).json({
          message,
          success: false,
        });
      }
    }
    await Product.findByIdAndDelete(productId).session(session);
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
