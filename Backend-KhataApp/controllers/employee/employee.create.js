import {
  Department,
  Gender,
  EmploymentStatus,
  Shift,
  ReportsToModel,
} from "../../constants/enums.js";
import { Employee } from "../../models/index.js";

export const createEmployeeController = async (req, res) => {
  try {
    const {
      name, //
      employeeId, //
      phoneNumber,
      password, //
      position,
      positionDescription,
      role,
      email, //
      address,
      gender,
      department,
      departmentDescription,
      hireDate,
      salary,
      status,
      statusDescription,
      skills,
      shift,
      shiftDescription,
      reportsTo,
      reportsToModel,
    } = req.body;

    if (
      !name ||
      !email ||
      !employeeId ||
      !position ||
      !role ||
      !AdminRole.includes(role) ||
      !gender ||
      !Gender.includes(gender) ||
      !department ||
      !Department.includes(department) ||
      (department === "Other" && !departmentDescription) ||
      !hireDate ||
      !salary ||
      !status ||
      !EmploymentStatus.includes(status) ||
      (status === "Other" && !statusDescription) ||
      !shift ||
      !Shift.includes(shift) ||
      (shift === "Other" && !shiftDescription) ||
      !reportsTo ||
      !reportsToModel ||
      !ReportsToModel.includes(reportsToModel)
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Some required fields are missing",
        success: false,
      });
    }
    const [
      existingOwnerById,
      existingOwnerByBusinessName,
      existingOwnerByPhoneNumber,
    ] = await Promise.all([
      Owner.findOne({ ownerId }),
      Owner.findOne({ businessName }),
      Owner.findOne({ businessPhoneNumber }),
    ]);

    if (
      existingOwnerById ||
      existingOwnerByBusinessName ||
      existingOwnerByPhoneNumber.businessName.toLowerCase() === businessName
    ) {
      return res.status(resType.BAD_REQUEST.code).json({
        message:
          "Credientials already in use:'ID', 'Business Name', 'Business Phone Number'",
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
      phoneNumber: phoneNumber || null,
      email,
      address: address || null,
      ownerId,
      password: encryptedPassword,
      businessAddress,
      businessName,
      businessPhoneNumber,
      businessDescription: businessDescription || null,
      businessType,
      role,
      equity,
      gstNumber,
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
