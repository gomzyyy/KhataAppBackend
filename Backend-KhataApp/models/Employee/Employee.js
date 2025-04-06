import { Schema, model } from "mongoose";
import { sharedUser } from "../Shared/shared.user.js";
import {
  CreatedByModel,
  Department,
  EmploymentStatus,
  Gender,
  Position,
  ReportsToModel,
  Shift,
} from "../../constants/enums.js";

const employeeSchema = new Schema(
  {
    ...sharedUser,
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
      enum: [...ReportsToModel],
    },
    permissions: {
      customer: {
        create: {
          type: Boolean,
          default: false,
        },
        update: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      employee: {
        create: {
          type: Boolean,
          default: false,
        },
        update: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      product: {
        create: {
          type: Boolean,
          default: false,
        },
        update: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      soldProduct: {
        create: {
          type: Boolean,
          default: true,
        },
        update: {
          type: Boolean,
          default: true,
        },
        delete: {
          type: Boolean,
          default: true,
        },
      },
      docs: {
        create: {
          type: Boolean,
          default: false,
        },
        update: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      analytics: {
        accessable: {
          type: Boolean,
          default: false,
        },
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },
    createdByModel: {
      type: String,
      required: true,
      enum: [...CreatedByModel],
    },
  },
  { timestamps: true }
);
const Employee = model("Employee", employeeSchema);
export default Employee;
