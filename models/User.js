const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, validate: {
    validator: function(v) {
      return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
    },
    message: props => `${props.value} is not a valid email address.`
  } },
  password: { type: String, required: true, validate: {
    validator: function(v) {
      return v.length >= 8;
    },
    message: props => `Password must be at least 8 characters long.`
  } },
  active: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messageLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MessageList' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;