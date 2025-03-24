import { Schema, model } from "mongoose";
import Shared from "../shared.js";
import {
  Department,
  EmploymentStatus,
  Gender,
  Position,
  Shift,
} from "../../constants/enums";

const employeeSchema = new Schema(
  {
    ...Shared,
    employeeId: {
      type: String,
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: [...Gender],
      required: true,
    },
    department: {
      type: String,
      enum: [...Department],
      required: true,
    },
    departmentDescription: { type: String },
    position: { type: String, enum: [...Position], required: true },
    positionDescription: { type: String },
    email: {
      type: String,
    },
    hireDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [...EmploymentStatus],
      required: true,
    },
    statusDescription: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    shift: {
      type: String,
      enum: [...Shift],
      required: true,
    },
    shiftDescription: {
      type: String,
    },
    reportsTo: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "reportsToModel",
    },
    reportsToModel: {
      type: String,
      required: true,
      enum: ["Owner", "Employee"],
    },
  },
  { timestamps: true }
);
const Employee = model("Employee", employeeSchema);
export default Employee;
