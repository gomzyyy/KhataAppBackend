import dotenv from "dotenv";
// Environment config
dotenv.config({});
import routes from "./routes/routes.js";
import { connectDB } from "./service/cloud.js";
//app initialization
import { app } from "./socket/socket_server.js";
//constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

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
