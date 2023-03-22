const mongoose = require('mongoose');

const friendshipRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const doc = await this.constructor.findOne({ requester: v, addressee: this.addressee, status: { $nin: ["cancelled", "refused"] } });
        return !doc;
      },
      message: 'The requester and addressee must be different.'
    }
  },
  addressee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const doc = await this.constructor.findOne({ requester: this.requester, addressee: v, status: { $nin: ["cancelled", "refused"] } });
        return !doc;
      },
      message: 'The requester and addressee must be different.'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'cancelled', 'refused'],
    validate: {
      validator: function(v) {
        return v !== 'accepted';
      },
      message: 'Cannot send a new friend request when an existing one is accepted.'
    }
  },
});

module.exports = mongoose.model('FriendshipRequest', friendshipRequestSchema);
