import { Router } from "express";
import { checkForUpdates } from "../controllers/appControl/appControl.js";
import {
  loginController,
  signupController,
  createEmployeeController,
  setImageController,
} from "../controllers/index.js";
import { uploadImage } from "../middlewares/index.js";
import { auth } from "../middlewares/index.js";

const routes = Router();

//auth
routes.get("/check-updates", checkForUpdates);
routes.post("/login", loginController);
routes.post("/signup", signupController);

//creation
routes.post("/create/employee", createEmployeeController);

routes.post(
  "/upload/image/single",
  auth,
  uploadImage.single("img"),
  setImageController
);
routes.post("/upload/image/test", uploadImage.single("img"), (req, res) => {
  console.log(req.file.path);
});
export default routes;
