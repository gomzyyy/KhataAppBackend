import dotenv from "dotenv";
// Environment config
dotenv.config({});

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/routes.js";
import { connectDB } from "./service/cloud.js";

//app initialization
const app = express();

//constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
//middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

//routes
app.get("/test", (req, res) =>
  res.status(200).send(`Server active at http://localhost:${PORT}`)
);
app.use("/api/app", routes);

// server listening at PORT
app.listen(PORT, HOST, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  connectDB();
});
