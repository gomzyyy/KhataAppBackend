import {
  Department,
  Gender,
  EmploymentStatus,
  Shift,
  ReportsToModel,
  CreatedByModel,
  Position,
  AdminRole,
} from "../../../constants/enums.js";
import { Employee, Owner } from "../../../models/index.js";
import { encryptPassword } from "../../../helpers/auth.helper.js";
import { resType } from "../../../lib/response.js";

export const createEmployeeController = async (req, res) => {
  try {
    const { creatorId, createdBy } = req.query;
    const {
      name, //
      employeeId, //
      image,
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

    if (!creatorId || !createdBy || !CreatedByModel.includes(createdBy)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "You are not authorised of this action.",
        success: false,
      });
    }
    let creator;
    if (mongoose.Types.ObjectId.isValid(creatorId)) {
      if (createdBy === "Partner") {
        creator = await Partner.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })?.select("-password");
      } else if (createdBy === "Employee") {
        creator = await Employee.findOne({
          _id: creatorId,
          "permissions.customer.create": true,
        })?.select("-password");
      } else {
        creator = await Owner.findById(creatorId);
      }
    } else {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid creator Object ID.",
        success: false,
      });
    }
    if (!creator) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "You are not an Authorised user to perform this action",
        success: false,
      });
    }

    const isExisting = await Employee.findOne({ userId });
    if (isExisting) {
      return res.status(resType.CONFLICT.code).json({
        message: "Employee exists with the given ID.",
        success: false,
      });
    }

    const owner = await Owner.findById(businessOwnerId);

    let hr;
    if (hrUid) {
      hr = await Employee.findOne({ userId: hrUid, department: "HR" });
    }
    if (reportsToModel === "Employee" && !hr) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "HR not found with the given ID.",
        success: false,
      });
    }
    if (!owner) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Owner not found with the given ID.",
        success: false,
      });
    }

    const encryptedPassword = await encryptPassword(password);
    if (!encryptedPassword) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Error occured while encrypting user credentials",
        success: false,
      });
    }

    const newEmployeeData = {
      name,
      userId: employeeId,
      phoneNumber: {
        value: phoneNumber || undefined,
        verified: false,
      },
      password: encryptedPassword,
      position,
      positionDescription: positionDescription || undefined,
      role,
      image: image || undefined,
      email: {
        value: email,
        verified: false,
      },
      address,
      gender,
      department,
      departmentDescription: departmentDescription || undefined,
      salary,
      status,
      statusDescription: statusDescription || undefined,
      skills: skills || undefined,
      shift,
      shiftDescription: shiftDescription || undefined,
      reportsTo: reportsToModel === "Owner" ? owner._id : hr._id,
      reportsToModel,
      businessOwner: owner._id,
      hireDate: new Date(),
      createdBy: creator._id,
      createdByModel: createdBy,
    };

    const newEmployee = new Employee(newEmployeeData);
    await newEmployee.save();
    return res.status(resType.OK.code).json({
      message: "Signup success",
      data: {
        user: newEmployee,
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
