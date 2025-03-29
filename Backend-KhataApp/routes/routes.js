import { Router } from "express";
import { checkForUpdates } from "../controllers/appControl/appControl.js";
import {
  loginController,
  signupController,
  createEmployeeController,
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

routes.post("/upload/image/single", uploadImage.single("img"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded or invalid format!" });
  }
  res.status(200).json({
    message: "Image uploaded successfully!",
    fileName: req.file.filename,
    filePath: `uploads/images/${req.file.filename}`,
  });
});
export default routes;
