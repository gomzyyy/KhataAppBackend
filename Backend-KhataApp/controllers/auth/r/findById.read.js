import { Owner, Employee, Partner } from "../../../models/index.js";
import { resType } from "../../../lib/response.js";
import { AdminRole } from "../../../constants/enums.js";

export const findByIdController = async (req, res) => {
  try {
    console.log("vorro")
    const { userId, role } = req.query;
    if (!userId || !role) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Required queries are not provided.",
        success: false,
      });
    }
    if (!AdminRole.includes(role)) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: "Invalid role.",
        success: false,
      });
    }
    let user;
    if (role === "Owner") {
      user = await Owner.findOne({ userId });
    } else if (role === "Partner") {
      user = await Partner.findOne({ userId });
    } else if (role === "Employee") {
      user = await Employee.findOne({ userId });
    }
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: `No ${role} found with this userID`,
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: `${role} found!`,
      data: {
        name: user.name,
        role
      },
      success: true,
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
