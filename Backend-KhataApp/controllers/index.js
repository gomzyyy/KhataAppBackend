import {
  getUpdatedUser,
  loginController,
  signupController,
} from "./auth/auth.js";
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
import { updateOwnerPropertiesController } from "./owner/u/updateOwnerProperties.update.js";
import { updateOwnerController } from "./owner/u/updateOwner.update.js";
import { getOwnerInfoController } from "./owner/r/getOwnerInfo.read.js";
import { updateSoldProductController } from "./soldProduct/u/updateSoldProduct.update.js";
import {
  requestOtpController,
  verifyEmailController,
} from "./auth/verifyEmail.js";
import { findByIdController } from "./auth/r/findById.read.js";
import { validateTokenController } from "./auth/validateToken.js";

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
  updateSoldProductController,
  deleteSoldProductController,
  getSoldProductsController,
  updateOwnerPropertiesController,
  updateOwnerController,
  getOwnerInfoController,
  requestOtpController,
  verifyEmailController,
  findByIdController,
  validateTokenController,
  getUpdatedUser,
};
