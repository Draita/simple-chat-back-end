const Participant = require("../models/participantModel");
const Room = require("../models/roomModel");



async function createPrivateRoom(user1Id, user2Id) {
  // Check if users already share a private room
  const existingRoom = await Room.findOne({
    type: "private",
    "participants.user": { $all: [user1Id, user2Id] },
  });

  if (existingRoom) {
    console.log("Users already share a private room");
    return existingRoom;
  }

  // Create new private room
  const room = await Room.create({ type: "private" });

  // Add participants
  await Participant.create([
    { user: user1Id, room: room._id },
    { user: user2Id, room: room._id },
  ]);

  console.log("Private room created");
  return room;
}



async function setRoomNameAndId(room, userId) {
  const roomId = room._id;
  const type = room.type;
  const user = {};

  // If the room is private, find the other participant and update the room name
  if (type === "private") {
    const participantsRoom = await Participant.find({ room: roomId })
      .populate("room")
      .populate("user", "username");

    const otherParticipant = participantsRoom.find(
      (p) => !p.user._id.equals(userId)
    );
    if (otherParticipant) {
      user.username = otherParticipant.user.username;
      user._id = otherParticipant.user._id
    }
  }

  room.user = user;


  return room;
}

module.exports = {
  createPrivateRoom,
  setRoomNameAndId,
};