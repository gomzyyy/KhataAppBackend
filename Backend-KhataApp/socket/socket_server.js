import express from "express";
import { Server } from "socket.io";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

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

const server = http.createServer(app);

const io = new Server(server, { cors: corsOptions });

const users = {};
export const getSocketIdCorrespondingToUserId = (userId) => users[userId];
io.on("connection", (socket) => {
  console.log("new connection");
  const uid = socket.handshake.query.uid;
  if (uid) {
    users[uid] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(users));
  socket.on("disconnect", () => {
    if (uid) {
      delete users[uid];
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, server, io };
