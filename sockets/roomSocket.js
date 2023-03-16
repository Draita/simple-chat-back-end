const Message = require("../models/messageModel");
const Room = require("../models/roomModel");
const { setRoomName } = require("../services/privateRoomService");
const { socketAuthMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Participant = require("../models/participantModel");

module.exports = (io) => {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    console.log("User connected");

    socket.on("join room", async (roomId) => {
      console.log(`User joined room ${roomId}`);
      socket.join(roomId);
      socket.roomId = roomId;
      // Retrieve the last 50 messages from the database
      const messages = await Message.find({ room: roomId })
        .populate("user", "username")
        .sort({ time: -1 })
        .limit(50)
        .lean();



      // Emit the messages to the client
      socket.emit("load messages", messages.reverse());

      // send room data
      const roomI = await Room.find({ _id: roomId });

      const room = await setRoomName(roomI[0], socket.user._id);


      // send participants
      const updatedParticipants = await Participant
        .find({ room: roomId })
        .populate('user')
        .lean()
        .exec();

      const updatedParticipantsWithIsUserSelf = updatedParticipants.map(participant => {
        return {
          ...participant,
          isUserSelf: (participant.user._id).equals(socket.user._id)
        }
      });
      socket.emit("participants", updatedParticipantsWithIsUserSelf);

      socket.emit("update room data", room);
      socket.emit("done", "")
    });

    socket.on("new message", async (message) => {
      console.log("New message:", message);
      message.room = socket.roomId;
      message.user = socket.user;
      console.log(message);

      // Save the new message to the database
      const newMessage = await Message.create(message);

      // Emit the new message to all clients in the same room
      socket.emit("new message", newMessage);

      // io.to(newMessage.room).emit("new message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
