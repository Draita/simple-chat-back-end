const {
  loadMoreMessages,
  leaveRoom,
  createNotification,
  joinRoom,
  saveMessage
} = require("../controllers/roomController");

module.exports = (io,socket) => {


    socket.on("join room", async (roomId) => {
      await joinRoom(io, socket, roomId);
    });

    socket.on("leave room", () => {
      leaveRoom(socket);
    });

    socket.on("new message", async (message) => {

      const savedMessage = await saveMessage(message, socket.user, socket.roomId);
      await createNotification(socket, savedMessage, io);
      io.to(socket.roomId).emit("new message", savedMessage);
    });

    socket.on("load more messages", async (lastMessageId) => {
      await loadMoreMessages(socket, lastMessageId);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });

};
