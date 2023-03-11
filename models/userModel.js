const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  tag: { type: Number, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: props => `${props.value} is not a valid email address.`
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 8;
      },
      message: props => `Password must be at least 8 characters long.`
    }
  },
  active: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  token: { type: String, required: true, unique: true },
});

userSchema.index({ username: 1, tag: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
