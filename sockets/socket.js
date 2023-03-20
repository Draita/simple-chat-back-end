const { socketAuthMiddleware } = require("../middlewares/authMiddleware");
const roomChatFunctionalitySocket = require("./roomChatFunctionalitySocket");
const roomListSocket = require("./roomListSocket");
const User = require("../models/userModel");

module.exports = (io) => {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    console.log("User connected");

    // Update user's isOnline status to true and add socket ID to list
    const user = await User.findByIdAndUpdate(
      socket.user._id,
      { $set: { isOnline: true }, $push: { connectedSockets: socket.id } },
      { new: true }
    );

    roomChatFunctionalitySocket(io, socket);
    roomListSocket(io, socket);

    socket.on("disconnect", async () => {
      console.log("User disconnected");

      // Update user's isOnline status to false and remove socket ID from list
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { isOnline: false }, $pull: { connectedSockets: socket.id } },
        { new: true }
      );
    });
  });
};