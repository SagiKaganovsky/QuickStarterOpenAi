import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  console.log("Socket is initializing");
  const io = new Server(res.socket.server);

  const MessageHandler = (msg) => {
    const message = "messsage from server: " + msg;
    io.emit("receive-message", message);
  };

  io.on("connection", (socket) => {
    socket.on("send-message", (msg) => {
      MessageHandler(msg);
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  });

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;
