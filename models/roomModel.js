const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  name: { type:String },
  type: { type: String},
});

module.exports = mongoose.model('Room', RoomSchema);