const express = require("express");
const cors = require("cors");
const {createServer} = require("http");

const port = 3000;

const app = express();
app.use(cors);
const http = createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connect!!");
  socket.on("join_room", ({roomName, userName}) => {
    socket.join(roomName, () => {
      // 소켓에 사용자 이름 저장
      socket.userName = userName;

      // 방에 조인 후 해당 방의 소켓 목록과 사용자 이름 확인
      const roomSockets = io.sockets.adapter.rooms[roomName].sockets;
      const socketNames = Object.keys(roomSockets).map((socketId) => {
        const userSocket = io.sockets.sockets[socketId];
        console.log(`Room: ${roomName}, Users: ${socketNames.join(", ")}`);
        return `${userSocket.userName} (${socketId})`;
      });
    });
    console.log("roomName : ", roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

http.listen(port, () => {
  console.log(port + "서버 열림");
});
