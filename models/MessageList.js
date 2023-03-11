const mongoose = require('mongoose');

const messageListSchema = new mongoose.Schema({
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const MessageList = mongoose.model('MessageList', messageListSchema);

module.exports = MessageList;