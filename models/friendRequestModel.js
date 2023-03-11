const mongoose = require('mongoose');

const friendshipRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const doc = await this.constructor.findOne({ requester: v, addressee: this.addressee });
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
        const doc = await this.constructor.findOne({ requester: this.requester, addressee: v });
        return !doc;
      },
      message: 'The requester and addressee must be different.'
    }
  },
  status: { type: String, required: true, default: 'pending' },
});

module.exports = mongoose.model('FriendshipRequest', friendshipRequestSchema);