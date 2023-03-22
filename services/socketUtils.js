const { compareSync } = require("bcrypt");
const Participant = require("../models/participantModel");
const Room = require("../models/roomModel");
const { getConnectedSockets } = require("../services/userStatus");

async function emitToUsers(io,userIDs, emitString, data) {
  console.log("userIds: "+userIDs)
  for (var i = 0; i < userIDs.length; i++) {
    const userSockets = await getConnectedSockets(userIDs[i]);
    console.log(userSockets)
    for (var k = 0; k < userSockets.length; k++) {
      console.log("emitToUser:"+ userSockets[k])
        io.to(userSockets[k]).emit(emitString, data);
    }
  }
}

module.exports = {
  emitToUsers,
};
