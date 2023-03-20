const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  name: { type:String },
  type: { type: String},
  user: { type: Object, virtual: true },
  notification: { type: Object, virtual: true },
  lastMessage: { type: Object, virtual: true },
});

// Add virtuals option to toJSON() method
RoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Room', RoomSchema);