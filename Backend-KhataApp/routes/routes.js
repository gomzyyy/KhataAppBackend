import { Router } from "express";
import { checkForUpdates } from "../controllers/app-control/appControl.js";
import {
  loginController,
  signupController,
  createEmployeeController,
  createPartnerController,
  createProductController,
  createSoldProductController,
  createCustomerController,
  deleteSoldProductController,
  getSoldProductsController,
  updateOwnerPropertiesController,
  updateOwnerController,
  getOwnerInfoController,
  updateSoldProductController,
  requestOtpController,
  findByIdController,
  validateTokenController,
  getUpdatedUser,
  verifyEmailController,
} from "../controllers/index.js";
import { uploadImage } from "../middlewares/index.js";
import { auth } from "../middlewares/index.js";

const routes = Router();

//auth
routes.get("/check-updates", checkForUpdates);
routes.post("/login", loginController);
routes.post("/signup", signupController);
routes.post("/validate/token", auth, validateTokenController);
routes.post("/validate/otp", auth, verifyEmailController); //

//create
routes.post("/create/employee", auth, createEmployeeController); //
routes.post(
  "/create/customer",
  auth,
  uploadImage.single("img"),
  createCustomerController
); //
routes.post("/create/partner", auth, createPartnerController); //
routes.post(
  "/create/product",
  auth,
  uploadImage.single("img"),
  createProductController
); //
routes.post("/sell/product", auth, createSoldProductController); //
routes.post("/request/otp", auth, requestOtpController); //

//delete
routes.post("/delete/sold-product", auth, deleteSoldProductController); //

//read
routes.get("/find/user", findByIdController); //
routes.get("/get/sold-products", auth, getSoldProductsController); //
routes.get("/get/owner/info", auth, getOwnerInfoController); //
routes.get("/get/user", auth, getUpdatedUser);

//update
routes.post("/update/owner/properties", auth, updateOwnerPropertiesController); //
routes.post(
  "/update/owner",
  uploadImage.single("image"),
  updateOwnerController
); //
routes.post("update/sold-product", auth, updateSoldProductController); //

routes.post(
  "/upload/image/test",
  auth,
  uploadImage.single("img"),
  (req, res) => {
    console.log(req.file.path);
  }
);
export default routes;
