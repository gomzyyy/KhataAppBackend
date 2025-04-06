import { Owner } from "../../../models/index.js";
import resType from "../../../lib/response.js";
import { AdminRole } from "../../../constants/enums.js";
import mongoose from "mongoose";

export const updateOwnerPropertiesController = async (req, res) => {
  try {
    const { role,uid } = req.query;
    // const uid = req.uid;
    const {
      searchable,
      isDisabled,
      accessBusinessInfo,
      isPrivate,
      partnerSearchable,
      employeeSearchable,
    } = req.body;
    if (
      searchable === undefined &&
      isDisabled === undefined &&
      accessBusinessInfo === undefined &&
      isPrivate === undefined &&
      partnerSearchable === undefined &&
      employeeSearchable === undefined
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "No updates provided.",
        success: false,
      });
    }
    if (!uid || !role || !AdminRole.includes(role) || role !== "Owner") {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required credentials are missing.",
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Can't find the owner due to incorrect Object ID.",
        success: false,
      });
    }

    const owner = await Owner.findById(uid);
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No owner found with the given credentials",
        success: false,
      });
    }
    const propertiesToUpdate = {
      searchable,
      isDisabled,
      accessBusinessInfo,
      isPrivate,
      partnerSearchable,
      employeeSearchable,
    };

    for (const key in propertiesToUpdate) {
      if (propertiesToUpdate[key] !== undefined) {
        owner.properties[key] = propertiesToUpdate[key];
      }
    }

    await owner.save();

    return res.status(resType.OK.code).json({
      message: "Owner properties updated successfully.",
      success: true,
      updatedProperties: owner.properties,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message:
        error instanceof Error
          ? error.message
          : "Internal server error occurred.",
      success: false,
    });
  }
};
