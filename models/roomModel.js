const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
});

module.exports = mongoose.model('Message', messageSchema);