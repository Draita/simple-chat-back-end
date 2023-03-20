const Room = require("../models/roomModel");
const Participant = require("../models/participantModel");
const { setRoomName } = require("../services/privateRoomService");


const Message = require("../models/messageModel");

const { setRoomNameAndId } = require("../services/privateRoomService");
const Notification = require("../models/notificationModel");
const { isUserOnline, getConnectedSockets } = require("../services/userStatus");

// async function getRoomList(req, res, next) {
//   try {
//     const userId = req.user._id;
//     // Get all the participants associated with the user
//     const participants = await Participant.find({ user: userId })
//       .populate("room")
//       .populate("user", "username");

//     // Map over the participants to update the room names if it's a private room
//     const updatedParticipants = await Promise.all(
//       participants.map(async (participant) => {
//         selectedRoom = participant.room;
//         return setRoomName(selectedRoom, userId);
//       })
//     );

//     // Send the updated list of participants as response
//     res.json(updatedParticipants);
//   } catch (err) {
//     next(err);
//   }
// }

async function saveMessage(message, user,roomId) {

  try {
    const newMessage = await Message.create({content: message.content, user: user,room:roomId});
    await newMessage.save();
    console.log(newMessage)
    return newMessage;
  } catch (err) {
    console.log(err)
  }
}

const joinRoom = async (io, socket, roomId) => {
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

  const room = await setRoomNameAndId(roomI[0], socket.user._id);

  // send participants
  const updatedParticipants = await Participant.find({ room: roomId })
    .populate("user")
    .lean()
    .exec();

  const updatedParticipantsWithIsUserSelf = updatedParticipants.map(
    (participant) => {
      return {
        ...participant,
        isUserSelf: participant.user._id.equals(socket.user._id),
      };
    }
  );
  console.log(`User joined room ${roomId}`);

  socket.emit("participants", updatedParticipantsWithIsUserSelf);
  socket.emit("update room data", room);
  socket.emit("done", "");
};

const leaveRoom = (socket) => {
  console.log(`User left room ${socket.roomId}`);
  socket.leave(socket.roomId);
};

const loadMoreMessages = async (socket, lastMessageId) => {
  const messages = await Message.find({
    room: socket.roomId,
    _id: { $lt: lastMessageId },
  })
    .populate("user", "username")
    .sort({ time: -1 })
    .limit(50)
    .lean();
  console.log(messages);
  socket.emit("more messages loaded", messages.reverse());
};

const createNotification = async (socket, message, io) => {
  const participants = await Participant.find({
    room: socket.roomId,
  }).populate("user");

  for (const participant of participants) {
    if (participant.user._id.toString() !== socket.user._id.toString()) {
      // User is not in the room
      // Increment message count in the notification
      const notification = await Notification.findOneAndUpdate(
        { user: participant.user._id, room: socket.roomId },
        { $inc: { messageCount: 1 }, isActive: true, lastMessage: message },
        { upsert: true, new: true }
      );

      // Emit the new notification to the user if they are online
      const participants = await Participant.find({
        room: socket.roomId,
      }).populate("user", "username");

      const notificationToSend = await Notification.findById(notification._id)
        .populate("lastMessage", "content")
        .populate("user");

      for (var i = 0; i < participants.length; i++) {
        const participant = participants[i];

        if (
          !participant.user._id.equals(socket.user._id) &&
          (await isUserOnline(participant.user._id))
        ) {
          const userSockets = await getConnectedSockets(participant.user._id);
          for (var g = 0; g < userSockets.length; g++) {
            io.to(userSockets[g]).emit("notification", notificationToSend);
          }
        }
      }
    }
  }
};

module.exports = {
  loadMoreMessages,
  leaveRoom,
  setRoomNameAndId,
  joinRoom,
  createNotification,
  saveMessage,
};

