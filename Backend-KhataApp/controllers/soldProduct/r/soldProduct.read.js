import mongoose from "mongoose";
import resType from "../../../lib/response.js";
import {
  Owner,
  Employee,
  Partner,
  SoldProduct,
  Customer,
} from "../../../models/index.js";
import { AdminRole, RequestForSoldProduct } from "../../../constants/enums.js";

export const getSoldProductsController = async (req, res) => {
  try {
    const { role, uid, requestFor, customerId } = req.query;

    if (
      !uid ||
      !requestFor ||
      !RequestForSoldProduct.includes(requestFor) ||
      (["CUSTOMER_PAID", "CUSTOMER_UNPAID", "CUSTOMER_ALL"].includes(
        requestFor
      ) &&
        !customerId)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Required resources not found.",
        success: false,
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(uid) ||
      (customerId && !mongoose.Types.ObjectId.isValid(customerId)) ||
      !role ||
      !AdminRole.includes(role)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object ID or Role.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid);
    } else if (role === "Partner") {
      user = await Partner.findById(uid).populate("businessOwner");
    } else if (role === "Employee") {
      user = await Employee.findById(uid).populate("businessOwner");
    } else {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid Role.",
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: `No ${role} or customers Found by the given ID.`,
        success: false,
      });
    }
    let filter = {};
    switch (requestFor) {
      case "ALL":
        filter;
        break;
      case "PAID_ALL":
        filter.paid = true;
        break;
      case "UNPAID_ALL":
        filter.paid = false;
        break;
      case "CUSTOMER_PAID":
        filter = { buyer: customerId, paid: true };
        break;
      case "CUSTOMER_UNPAID":
        filter = { buyer: customerId, paid: false };
        break;
      case "CUSTOMER_ALL":
        filter.buyer = customerId;
        break;
      default:
        return res.status(resType.BAD_REQUEST.code).json({
          message: `Request not specified.`,
          success: false,
        });
    }
    const data = await SoldProduct.find(filter).lean();
    return res.status(resType.OK.code).json({
      message:
        data.length > 0 ? "Success" : "No products sold to this customer.",
      data: { soldProducts: data },
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

// let data = [];
// if (requestFor === "ALL") {
//   data = await SoldProduct.find();
// } else if (requestFor === "PAID_ALL") {
//   data = await SoldProduct.find({ paid: true });
// } else if (requestFor === "UNPAID_ALL") {
//   data = await SoldProduct.find({ paid: false });
// } else if (requestFor === "PAID") {
//   data = await SoldProduct.find({ buyer: customerId, paid: true });
// } else if (requestFor === "UNPAID") {
//   data = await SoldProduct.find({ buyer: customerId, paid: false });
// } else if (requestFor === "CUSTOMER_SPECIFIC") {
//   data = await SoldProduct.find({ buyer: customerId });
// } else {
//   return res.status(resType.BAD_REQUEST.code).json({
//     message: `Request not specified.`,
//     success: false,
//   });
// }
