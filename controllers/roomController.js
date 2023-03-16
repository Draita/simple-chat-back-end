const Room = require("../models/roomModel");
const Participant = require("../models/participantModel");
const { setRoomName } = require('../services/privateRoomService');


async function getRoomList(req, res, next) {
  try {
    const userId = req.user._id;
    // Get all the participants associated with the user
    const participants = await Participant.find({ user: userId })
      .populate("room")
      .populate("user", "username");

    // Map over the participants to update the room names if it's a private room
    const updatedParticipants = await Promise.all(participants.map(async (participant) => {
      selectedRoom = participant.room
      return setRoomName(selectedRoom, userId)

    }));

    // Send the updated list of participants as response
    res.json(updatedParticipants);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRoomList,
};
