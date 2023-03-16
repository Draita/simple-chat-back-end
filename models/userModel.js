const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 11,
    validate: {
      validator: function(v) {
        return v.length <= 11;
      },
      message: props => `The username can't be longer than 11 characters`
    },
  },
  tag: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
    validate: {
      validator: function(v) {
        return /^[0-9]*$/.test(v);
      },
      message: props => `The tag must be a number`
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: props => `${props.value} is not a valid email address.`
    },
    select: false,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 8;
      },
      message: props => `Password must be at least 8 characters long.`
    },
    select: false,
  },
  profilePicture: {
    type: Buffer,
    select: false,
  },
  active: {
    type: Boolean,
    default: false,
    select:false
  },
  blocked: {
    type: Boolean,
    default: false,
    select:false
  },
  token: {
    type: String,
    required: true,
    unique: true,
    select:false
  },
});

userSchema.index({ username: 1, tag: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;