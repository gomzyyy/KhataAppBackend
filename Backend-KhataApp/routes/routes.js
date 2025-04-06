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
  updateSoldProductController
} from "../controllers/index.js";
import { uploadImage } from "../middlewares/index.js";
import { auth } from "../middlewares/index.js";

const routes = Router();

//auth
routes.get("/check-updates", checkForUpdates);
routes.post("/login", loginController);
routes.post("/signup", signupController);

//create
routes.post("/create/employee", createEmployeeController); //
routes.post("/create/customer", createCustomerController); //
routes.post("/create/partner", createPartnerController); //
routes.post("/create/product", createProductController); //
routes.post("/sell/product", createSoldProductController); //

//delete
routes.post("/delete/sold-product", deleteSoldProductController); //

//read
routes.get("/get/sold-products", getSoldProductsController); //
routes.get("/get/owner/info", getOwnerInfoController); //

//update
routes.post("/update/owner/properties", updateOwnerPropertiesController); //
routes.post(
  "/update/owner",
  uploadImage.single("image"),
  updateOwnerController
); //
routes.post("update/sold-product",updateSoldProductController)//

routes.post("/upload/image/test", uploadImage.single("img"), (req, res) => {
  console.log(req.file.path);
});
export default routes;
