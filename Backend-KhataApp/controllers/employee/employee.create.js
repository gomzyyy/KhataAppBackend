import {
  Department,
  Gender,
  EmploymentStatus,
  Shift,
  ReportsToModel,
} from "../../constants/enums.js";
import { Employee, Owner } from "../../models/index.js";
import { encryptPassword } from "../../helpers/auth.helper.js";
import { resType } from "../../lib/response.js";
import { AdminRole, Position } from "../../constants/enums.js";

export const createEmployeeController = async (req, res) => {
  try {
    const {
      name, //
      employeeId, //
      phoneNumber,
      password, //
      position, //
      positionDescription,
      role, //
      email, //
      address,
      gender, //
      department, //
      departmentDescription,
      salary, //
      status, //
      statusDescription,
      skills,
      shift, //
      shiftDescription,
      reportsToModel, //
      businessOwnerId, //
      hrUid,
    } = req.body;

    if (
      !businessOwnerId ||
      !name ||
      !email ||
      !employeeId ||
      !position ||
      !Position.includes(position) ||
      !role ||
      !AdminRole.includes(role) ||
      !gender ||
      !Gender.includes(gender) ||
      !department ||
      !Department.includes(department) ||
      (department === "Other" && !departmentDescription) ||
      !salary ||
      !status ||
      !EmploymentStatus.includes(status) ||
      (status === "Other" && !statusDescription) ||
      !shift ||
      !Shift.includes(shift) ||
      (shift === "Other" && !shiftDescription) ||
      !reportsToModel ||
      !ReportsToModel.includes(reportsToModel) ||
      (reportsToModel === "Employee" && !hrUid)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }

    const isExisting = await Employee.findOne({ employeeId });
    if (isExisting) {
      return res.status(resType.BAD_GATEWAY.code).json({
        message: "Employee exists with the given ID.",
        success: false,
      });
    }

    const owner = await Owner.findOne({ ownerId: businessOwnerId });

    let hr;
    if (hrUid) {
      hr = await Employee.findOne({ employeeId: hrUid, department:'HR' })
      console.log(hr)
    }
    if (reportsToModel === "Employee" && !hr) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "HR not found with the given ID.",
        success: false,
      });
    }
console.log("ljdbi")
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Owner not found with the given ID.",
        success: false,
      });
    }

    const encryptedPassword = await encryptPassword(password);
    if (!encryptedPassword) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Error occured while encrypting user credientials",
        success: false,
      });
    }

    const newEmployeeData = {
      name,
      employeeId,
      phoneNumber: phoneNumber || null,
      password: encryptedPassword,
      position,
      positionDescription: positionDescription || null,
      role,
      email,
      address,
      gender,
      department,
      departmentDescription: departmentDescription || null,
      salary,
      status,
      statusDescription: statusDescription || null,
      skills: skills || null,
      shift,
      shiftDescription: shiftDescription || null,
      reportsTo: reportsToModel === "Owner" ? owner._id : hr._id,
      reportsToModel,
      businessOwner: owner._id,
      hireDate: Date.now(),
    };

    const newBusinessOwner = new Employee(newEmployeeData);
    await newBusinessOwner.save();
    return res.status(resType.OK.code).json({
      message: "Signup success",
      data: {
        user: newBusinessOwner,
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
