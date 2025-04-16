import {
  SoldProduct,
  Product,
  Customer,
  Owner,
  Employee,
  Partner,
  SoldProductPaymentHistory,
} from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import mongoose from "mongoose";
import { AdminRole } from "../../../constants/enums.js";
import { populate_obj } from "../../../helpers/obj.js";

export const createSoldProductController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { buyerId, role, sellerId } = req.query;
    const { productId, count } = req.body;
    if (
      !productId ||
      !buyerId ||
      count === 0 ||
      count < 0 ||
      count == null ||
      !AdminRole.includes(role) ||
      !sellerId
    ) {
      await session.abortTransaction();
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
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid Object ID for product or buyer.",
        success: false,
      });
    }
    if (buyerId === sellerId) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "A seller cannot buy their own product.",
        success: false,
      });
    }
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Can't find the product",
        success: false,
      });
    }
    const owner = await Owner.findById(product.businessOwner).session(session);
    if (!owner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Can't find the product owner",
        success: false,
      });
    }
    if (product.stock < count) {
      await session.abortTransaction();
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
    }).populate(["soldBy", "product"]);
    if (alreadySold) {
      const existingHistory = await SoldProductPaymentHistory.findOne({
        reference: alreadySold._id,
      });
      alreadySold.count += count;
      product.stock -= count;
      product.totalSold += count;
      if (existingHistory) {
        existingHistory.info.amount = alreadySold.discountedPrice
          ? product.discountedPrice * alreadySold.count
          : product.basePrice * alreadySold.count;
        await existingHistory.save();
      }
      await Promise.all([
        product.save({ session }),
        alreadySold.save({ session }),
      ]);
      let updatedSeller;
      if (role === "Owner") {
        updatedSeller = await Owner.findById(sellerId)
          .populate(populate_obj[role])
          .session(session);
      } else if (role === "Partner") {
        updatedSeller = await Partner.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        })
          .populate(populate_obj[role])
          .session(session);
      } else if (role === "Employee") {
        updatedSeller = await Employee.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        })
          .populate(populate_obj[role])
          .session(session);
      }
      if (!updatedSeller) {
        await session.abortTransaction();
        return res.status(resType.UNAUTHORIZED.code).json({
          message: "You are unauthorised for selling products.",
          success: false,
        });
      }
      await session.commitTransaction();
      return res.status(resType.OK.code).json({
        message: "Product sold successfully!",
        data: { soldProduct: alreadySold, seller: updatedSeller },
        success: true,
      });
    } else {
      let seller;
      if (role === "Owner") {
        seller = await Owner.findById(sellerId).session(session);
      } else if (role === "Partner") {
        seller = await Partner.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        }).session(session);
      } else if (role === "Employee") {
        seller = await Employee.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        }).session(session);
      }
      if (!seller) {
        await session.abortTransaction();
        return res.status(resType.UNAUTHORIZED.code).json({
          message: "You are unauthorised for selling products.",
          success: false,
        });
      }

      const buyer = await Customer.findById(buyerId).session(session);
      if (!buyer) {
        await session.abortTransaction();
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
        count: product.quantity * count,
      });
      const newSoldProductHistory = new SoldProductPaymentHistory({
        referenceType: "SoldProduct",
        reference: newSoldProduct._id,
        info: {
          name: product.name,
          amount: product.discountedPrice
            ? product.discountedPrice * newSoldProduct.count
            : product.basePrice * newSoldProduct.count,
        },
        paymentDescription: `Product ${product.name}, was sold by ${
          seller.name
        } as ${seller.role} of our business, on ${new Date().toDateString()}`,
      });
      const newPaymentHistory = {
        payment: newSoldProductHistory._id,
        paymentType: "SoldProductPaymentHistory",
        createdAt: new Date(Date.now()),
        createdBy: seller._id,
        createdByModel: role,
        title: `Product '${product.name}' sold on ${new Date().toDateString()}`,
        amount: product.discountedPrice
          ? product.discountedPrice * newSoldProduct.count
          : product.basePrice * newSoldProduct.count,
        type: "DEBIT",
        shortNote: `This transaction documents the sale of '${product.name}', facilitated by ${seller.name} in their role as a ${seller.role}, and purchased by customer ${buyer.name}.`,
      };
      owner.history.payments.push(newPaymentHistory);
      buyer.buyedProducts.push(newSoldProduct._id);
      product.stock -= count * product.quantity;
      product.totalSold += count * product.quantity;

      await Promise.all([
        newSoldProductHistory.save({ session }),
        owner.save({ session }),
        product.save({ session }),
        newSoldProduct.save({ session }),
        buyer.save({ session }),
      ]);

      let newUpdatedSeller;
      if (role === "Owner") {
        newUpdatedSeller = await Owner.findById(sellerId)
          .populate(populate_obj[role])
          .session(session);
      } else if (role === "Partner") {
        newUpdatedSeller = await Partner.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        })
          .populate(populate_obj[role])
          .session(session);
      } else if (role === "Employee") {
        newUpdatedSeller = await Employee.findOne({
          _id: sellerId,
          "permissions.product.create": true,
        })
          .populate(populate_obj[role])
          .session(session);
      }
      if (!newUpdatedSeller) {
        await session.abortTransaction();
        return res.status(resType.UNAUTHORIZED.code).json({
          message: "You are unauthorised for selling products.",
          success: false,
        });
      }

      await session.commitTransaction();
      return res.status(resType.OK.code).json({
        message: "Product sold successfully!",
        data: { soldProduct: newSoldProduct, seller: newUpdatedSeller },
        success: true,
      });
    }
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
