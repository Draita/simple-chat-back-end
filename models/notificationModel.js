const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  messageCount: {
    type: Number,
    required: true,
    default: 0,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;