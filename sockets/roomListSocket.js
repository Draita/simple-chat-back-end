const Participant = require("../models/participantModel");
const Notification = require("../models/notificationModel");
const Message = require("../models/messageModel");

const { setRoomNameAndId } = require("../services/privateRoomService");

module.exports = (io, socket) => {
  socket.on("getRoomList", async () => {
    try {
      // Get all the participants associated with the user
      const participants = await Participant.find({ user: socket.user._id })
        .populate("room")
        .populate("user", "username");

      // Map over the participants to update the room names if it's a private room
      const updatedParticipants = await Promise.all(
        participants.map(async (participant) => {
          let selectedRoom = participant.room;
          selectedRoom = await setRoomNameAndId(selectedRoom, socket.user._id);

          // Add last message to the room object
          const lastMessage = await Message.findOne({
            room: selectedRoom.id
          }).sort({ time: -1 }).populate("user", "username");
          if (lastMessage) {
            selectedRoom.lastMessage = lastMessage;
          }

          // Add notification to the room object
          const notification = await Notification.findOne({
            user: socket.user._id,
            room: selectedRoom.id,
          }).populate("lastMessage","content").populate("user");
          if (notification) {
            selectedRoom.notification = notification;
          }

          return selectedRoom;
        })
      );

      // Emit the updated list of participants as the "roomList" event
      io.to(socket.id).emit("roomList", updatedParticipants);
    } catch (err) {
      console.error(err);
    }
  });


  socket.on("checkNotifications", async (roomId) => {
    try {
      // Find the notification for the current user and room
      const notification = await Notification.findOne({
        user: socket.user._id,
        room: roomId,
      });

      //   Emit the notification to the client
      io.to(socket.id).emit("notification", notification);
    } catch (err) {
      console.error(err);
    }
  });
};
