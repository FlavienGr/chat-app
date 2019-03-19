const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessages,
  generatelocationMessage
} = require("./utils/messages");
const {
  removeUser,
  addUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;
const path = require("path");
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("new websocket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return cb(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessages("Welcome"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessages(`${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    cb();
  });

  socket.on("sendMessage", (textMessage, cb) => {
    const { user } = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(textMessage)) {
      return cb("Profanity is not allowed !");
    }

    io.to(user.room).emit(
      "message",
      generateMessages(user.username, textMessage)
    );
    cb();
  });

  socket.on("sendLocation", ({ longitude, latitude }, cb) => {
    const { user } = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generatelocationMessage(
        user.username,
        `https://google.com/maps?q${latitude},${longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessages(`${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log("Connected and listen the port", port);
});
