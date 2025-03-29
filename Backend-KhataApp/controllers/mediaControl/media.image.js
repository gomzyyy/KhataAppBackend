import { AdminRole } from "../../constants/enums.js";
import resType from "../../lib/response.js";
import { Owner, Employee, Customer, Partner } from "../../models/index.js";
import { uploadToCloudinary } from "../../service/cloud.js";

export const setImageController = async (req, res) => {
  try {
    const userId = req.userId;
    const { role } = req.query;

    if (!userId || !role || !AdminRole.includes(role)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Unauthorized action.",
        success: false,
      });
    }
    if (!req.file || !req.file.path) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No media/file path found.",
        success: false,
      });
    }
    const { path } = req.file;

    let user;
    if (role === "Owner") {
      user = await Owner.findOne({ ownerId: userId });
    } else if (role === "Partner") {
      user = await Partner.findOne({ partnerId: userId });
    } else if (role === "Employee") {
      user = await Employee.findOne({ employeeId: userId });
    }
    if (!user) {
      return res.status(r.NOT_FOUND.code).json({
        message: "Token credientials didn't match to any user",
        success: false,
      });
    }

    const { code, url } = await uploadToCloudinary(path);
    if (code !== resType.OK.code || !url || url.trim().length === 0) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Failed to upload Media/File.",
        success: false,
      });
    }
    try {
      user.image = url;
      await user.save();
    } catch (error) {
      console.error("Error saving user image:", error);
      return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
        message: "Failed to save user image.",
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: "Success.",
      data: { imageUrl: url },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Internal server error.`,
      success: false,
    });
  }
};
