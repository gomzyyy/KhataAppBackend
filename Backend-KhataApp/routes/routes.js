import { Router } from "express";
import { checkForUpdates } from "../controllers/appControl/appControl.js";
import {
  loginController,
  employeeLoginController,
  signupController,
} from "../controllers/index.js";
const routes = Router();

routes.get("/check-updates", checkForUpdates);
routes.post("/login/owner", loginController);
routes.post("/login/employee", employeeLoginController);
export default routes;
