import { AdminRole } from "../../constants/enums.js";
import { resType } from "../../lib/response.js";
import { Owner, Employee, Partner } from "../../models/index.js";
import { generateToken, verifyPassword } from "../../helpers/auth.helper.js";

export const loginController = async (req, res) => {
  try {
    const { userId, loginAs, password } = req.body;
    if (!userId || !loginAs || !AdminRole.includes(loginAs) || !password) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: resType.BAD_REQUEST.message,
        success: false,
      });
    }
    const modelMap = {
      Owner: Owner,
      Partner: Partner,
      Employee: Employee,
    };

    const userModel = modelMap[loginAs];

    if (!userModel) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid login type",
        success: false,
      });
    }
    const idFieldMap = {
      Owner: "ownerId",
      Partner: "partnerId",
      Employee: "employeeId",
    };

    const idField = idFieldMap[loginAs];
    const user = await userModel.findOne({ [idField]: userId });
    if (!user) {
      return res.status(resType.NOT_FOUND.code).json({
        message: resType.NOT_FOUND.message,
        success: false,
      });
    }
    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return res.status(resType.UNAUTHORIZED.code).json({
        message: resType.UNAUTHORIZED.message,
        success: false,
      });
    }
    const token = generateToken({ UID: user[idField] });
    if (!token) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: resType.BAD_GATEWAY.message,
        success: false,
      });
    }
    return res.status(resType.OK.code).json({
      message: resType.OK.message,
      data: {
        user,
        token,
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

export const signupController = async (req, res) => {
  try {
    const {} = req.body;
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

// if (loginAs === "Employee") {
//   const employee = await Employee.findOne({ employeeId: userId })?.populate({});
//   if (!employee) {
//     return res.status(resType.NOT_FOUND.code).json({
//       message: resType.NOT_FOUND.message,
//       success: false,
//     });
//   }
//   const token = generateToken({ UID: employee.employeeId });
//   if(!token){
//     return res.status(resType.BAD_GATEWAY.code).json({
//       message: resType.BAD_GATEWAY.message,
//       success: false,
//     });
//   }
//   return res.status(resType.OK.code).json({
//     message: resType.OK.message,
//     data:{

//     },
//     success: true,
//   });
// }
