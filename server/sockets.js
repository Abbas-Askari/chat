const jwt = require("jsonwebtoken");
const socketIO = require("socket.io");
const activeUsers = [];
const Room = require("./models/room");

const getActiveUsers = () => activeUsers;

function init(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.userId = decoded.id;
      next();
    });
  }).on("connection", async (socket) => {
    console.log("a user connected", socket.userId);
    activeUsers.push(socket.userId);
    socket.broadcast.emit("user-connected", socket.userId);

    const rooms = await Room.find({
      users: { $in: [socket.userId] },
    }).exec();
    rooms.forEach((room) => {
      socket.join(room._id.toString());
    });

    socket.on("message", (message) => {
      console.log(message, "sockets!");
      if (typeof message.room !== "string") {
        console.log("Invalid room", message.room);
        return;
      }
      console.log("emitting message to room", message.room);
      socket.to(message.room).emit("message", message);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typing", data);
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      socket.broadcast.emit("user-disconnected", socket.userId);
      activeUsers.splice(activeUsers.indexOf(socket.userId), 1);
    });
  });
}

module.exports = {
  init,
  getActiveUsers,
};
