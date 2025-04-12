import mongoose from "mongoose";
import { resType } from "../../lib/response.js";
import { Employee, Owner, Partner } from "../../models/index.js";

export const validateTokenController = async (req, res) => {
  try {
    const uid = req.uid;
    console.log("ejbfpoi0");
    const { role } = req.query;
    if (!role || mongoose.Types.ObjectId.isValid(uid)) {
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findById(uid).populate([
        {
          path: "customers",
          populate: { path: "buyedProducts", populate: { path: ["product",'soldBy','buyer'] } },
        },
        "employeeData",
        "inventory",
      ]);
    } else if (role === "Partner") {
      user = await Partner.findById(uid).populate({
        path: "businessOwner",
        select: "-password -accessPasscode",
        populate: { path: ["customers", "employeeData", "inventory"] },
      });
    } else if (role === "Employee") {
      user = await Employee.findById(uid).populate({
        path: "businessOwner",
        select: "-password -accessPasscode",
        populate: { path: ["customers", "employeeData", "inventory"] },
      });
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
    console.log("ejbsljvfpoi0");
    return res.status(resType.OK.code).json({
      message: "Success.",
      data: {
        user,
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
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
