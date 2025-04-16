import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";
import {
  Customer,
  SoldProduct,
  SoldProductPaymentHistory,
} from "../../../models/index.js";
import resType from "../../../lib/response.js";

export const deleteCustomerController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerId, role } = req.query;
    const uid = req.uid;

    if (!customerId || !role) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required credentials are missing.",
        success: false,
      });
    }
    if (
      !uid ||
      !AdminRole.includes(role) ||
      !mongoose.Types.ObjectId.isValid(uid)
    ) {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Unauthorised action or invalid role or user Object ID.",
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      await session.abortTransaction();
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "invalid role or user Object ID.",
        success: false,
      });
    }
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      return res.status(resType.NOT_FOUND.code).json({
        message: "Unable to find customer.",
        success: false,
      });
    }
    const respectiveSoldProducts = await SoldProduct.find({
      buyer: customer._id,
    }).session(session);

    await Promise.all([
      ...respectiveSoldProducts.map((product) =>
        SoldProductPaymentHistory.findOneAndUpdate(
          { reference: product._id },
          { disabled: true }
        ).session(session)
      ),
      ...respectiveSoldProducts.map((d) => d.deleteOne({session})),
    ]);
    await customer.deleteOne({session});

    await session.commitTransaction();
    return res.status(resType.OK.code).json({
      message: "Customer deleted!",
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
