import dotenv from "dotenv";
// Environment config
dotenv.config({});
import routes from "./routes/routes.js";
import { connectDB } from "./service/cloud.js";
//app initialization
import { app } from "./socket/socket_server.js";
import { getAIResponse } from "./config/ai.config.js";
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
  // getAIResponse("Give me suggestions for my business growth, I have a small scale business of fruit juices and my last month sales was 45k INR and the best seller was Mango Juice with 455 sales and least sold was lichi juice with 49 sales give me suggestions on how can I grow more? get straight to the point and give me atleast 3 points of suggestions diffrentiate by '^' and dont over explain only give breif advice. every point should not exceed 20 words");
});
