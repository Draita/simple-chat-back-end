const { socketAuthMiddleware } = require("../middlewares/authMiddleware");
const roomChatFunctionalitySocket = require("./roomChatFunctionalitySocket");
const roomListSocket = require("./roomListSocket");
const friendSocket = require("./friendSocket");

const User = require("../models/userModel");

module.exports = (io) => {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    // Update user's isOnline status to true and add socket ID to list
    const user = await User.findByIdAndUpdate(
      socket.user._id,
      { $set: { isOnline: true }, $push: { connectedSockets: socket.id } },
      { new: true }
    );
    console.log("User connected: "+user.username);


    roomChatFunctionalitySocket(io, socket);
    roomListSocket(io, socket);
    friendSocket(io, socket);


    socket.on("disconnect", async () => {
      console.log("hereby the user is disconnect:"+socket.user.username)
      // Update user's isOnline status to false and remove socket ID from list
      const updatedUser = await User.findByIdAndUpdate(
        socket.user._id,
        { $set: { isOnline: false }, $pull: { connectedSockets: socket.id } },
        { new: true }
      );


    });
  });
};