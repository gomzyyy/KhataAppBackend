import mongoose from "mongoose";
import { resType } from "../../lib/response.js";
import { Employee, Owner, Partner } from "../../models/index.js";
import { populate_obj } from "../../helpers/obj.js";

export const validateTokenController = async (req, res) => {
  try {
    const uid = req.uid;
    const { role } = req.query;
    if (!role || !mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid user Object ID.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid)
        .populate(populate_obj[role])
        .populate({
          path: "history.payments",
          populate: [
            { path: "payment" }, // will use refPath: 'paymentType'
            { path: "createdBy" }, // will use refPath: 'createdByModel'
          ],
        });
    } else if (role === "Partner") {
      user = await Partner.findById(uid).populate(populate_obj[role]);
    } else if (role === "Employee") {
      user = await Employee.findById(uid).populate(populate_obj[role]);
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "User not found with the given ID",
        success: false,
      });
    }
    console.log(user);
    return res.status(resType.OK.code).json({
      message: "Success.",
      data: {
        user,
      },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `error occured!: ${
        error instanceof Error
          ? error.message
          : resType.INTERNAL_SERVER_ERROR.message
      }`,
      success: false,
    });
  }
};
