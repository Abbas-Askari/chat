require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const userRouter = require("./routers/user-router");
const authRouter = require("./routers/auth-router");
const roomRouter = require("./routers/room-router");
const attachmentRouter = require("./routers/attachment-router");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Room = require("./models/room");
const sockets = require("./sockets");

sockets.init(server);

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/rooms", roomRouter);
app.use("/attachments", attachmentRouter);
app.get("/users/online", (req, res) => {
  const onlineUsers = Object.keys(io.sockets.sockets);
  res.json(onlineUsers);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
