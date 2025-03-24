import { Router } from "express";
import { checkForUpdates } from "../controllers/appControl/appControl.js";
import { loginController, signupController } from "../controllers/index.js";
const routes = Router();

routes.get("/check-updates", checkForUpdates);
routes.get("/login", loginController);
export default routes;
