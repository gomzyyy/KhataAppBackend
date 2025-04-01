import { Router } from "express";
import { checkForUpdates } from "../controllers/app-control/appControl.js";
import {
  loginController,
  signupController,
  createEmployeeController,
  createPartnerController,
} from "../controllers/index.js";
import { uploadImage } from "../middlewares/index.js";
import { auth } from "../middlewares/index.js";

const routes = Router();

//auth
routes.get("/check-updates", checkForUpdates);
routes.post("/login", loginController);
routes.post("/signup", signupController);

routes.post("/create/employee", auth, createEmployeeController);
routes.post("/create/partner", createPartnerController);

routes.post("/upload/image/test", uploadImage.single("img"), (req, res) => {
  console.log(req.file.path);
});
export default routes;
