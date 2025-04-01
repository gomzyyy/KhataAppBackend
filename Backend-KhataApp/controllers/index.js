import { loginController, signupController } from "./auth/auth.js";
import { updateCustomerProfilePhoto } from "./customer/u/updateCustomerProfilePhoto.js";
import { updateEmployeeProfilePhoto } from "./employee/u/updateEmployeeProfilePhoto.js";
import { updateOwnerProfilePhoto } from "./owner/u/updateOwnerProfilePhoto.js";
import { createEmployeeController } from "./employee/c/employee.create.js";
import { createPartnerController } from "./partner/c/partner.create.js";
import { createCustomerController } from "./customer/c/customer.create.js";

export {
  loginController,
  signupController,
  updateCustomerProfilePhoto,
  updateEmployeeProfilePhoto,
  updateOwnerProfilePhoto,
  createEmployeeController,
  createCustomerController,
  createPartnerController,
};
