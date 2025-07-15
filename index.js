const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let userCounter = 0;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  userCounter++;
  io.emit("user", userCounter);
  console.log("A user connected.");

  socket.on("disconnect", () => {
    userCounter--;
    io.emit("user", userCounter);
    console.log("A user disconnected.");
  });

  socket.on("audioMessage", (msg) => {
    socket.broadcast.emit("audioMessage", msg);
  });
});

http.listen(3000, () => {
  console.log("Listening on port 3000.");
});
