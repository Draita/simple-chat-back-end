const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;