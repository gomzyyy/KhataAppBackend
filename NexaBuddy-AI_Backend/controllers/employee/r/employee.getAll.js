import { Owner } from "../../../models/index.js";
import resType from "../../../lib/response.js";
import mongoose from "mongoose";

export const getEmployeeListController = async (req, res) => {
  try {
    const { oid } = req.query; //oid === ownerId #Owner
    if (!oid || !mongoose.Types.ObjectId.isValid(oid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    const owner = await Owner.findById(oid)
      .populate({ path: "EmployeeData", match: { status: "Active" } })
      .select("-password");
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Owner not found with the given ID",
        success: false,
      });
    }
    if (!owner.EmployeeData?.length) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No active employees found under this owner",
        success: false,
      });
    }

    const employees = owner.EmployeeData;
    return res.status(resType.OK.code).json({
      message: "Employee list fetched successfully",
      data: {
        employees,
      },
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
