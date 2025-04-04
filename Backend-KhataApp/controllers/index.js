import { loginController, signupController } from "./auth/auth.js";
import { updateCustomerProfilePhoto } from "./customer/u/updateCustomerProfilePhoto.js";
import { updateEmployeeProfilePhoto } from "./employee/u/updateEmployeeProfilePhoto.js";
import { updateOwnerProfilePhoto } from "./owner/u/updateOwnerProfilePhoto.js";
import { createEmployeeController } from "./employee/c/employee.create.js";
import { createPartnerController } from "./partner/c/partner.create.js";
import { createCustomerController } from "./customer/c/customer.create.js";
import { createProductController } from "./product/c/product.create.js";
import { createSoldProductController } from "./soldProduct/c/soldProduct.create.js";
import { deleteSoldProductController } from "./soldProduct/d/soldProduct.delete.js";
import { getSoldProductsController } from "./soldProduct/r/soldProduct.read.js";

export {
  loginController,
  signupController,
  updateCustomerProfilePhoto,
  updateEmployeeProfilePhoto,
  updateOwnerProfilePhoto,
  createEmployeeController,
  createCustomerController,
  createPartnerController,
  createProductController,
  createSoldProductController,
  deleteSoldProductController,
  getSoldProductsController
};
