const FriendRequest = require('../models/friendRequestModel');
const User = require('../models/userModel');


async function sendFriendRequest(req, res, next) {
  try {
    const requesterId = req.user._id
    const { usernameAndTag } = req.body;
    const [username, tag] = usernameAndTag.split('#');
    console.log(tag)

    if (!username || !tag) {
      return res.status(400).json({ error: 'Invalid username and tag.' });
    }

    const addressee = await User.findOne({ username, tag });
    if (!addressee) {
      return res.status(404).json({ error: 'Addressee not found.' });
    }



    const request = new FriendRequest({ requester: requesterId, addressee: addressee._id });
    await request.save();
    return res.status(201).json({ message: 'Friend request sent.' });
  } catch (error) {
    return next(error);
  }
}

async function acceptFriendRequest(req, res, next) {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Friend request already accepted or blocked.' });
    }
    request.status = 'accepted';
    await request.save();
    await User.findByIdAndUpdate(request.requesterId, { $addToSet: { friends: request.addresseeId } });
    await User.findByIdAndUpdate(request.addresseeId, { $addToSet: { friends: request.requesterId } });
    return res.status(200).json({ message: 'Friend request accepted.' });
  } catch (error) {
    return next(error);
  }
}

async function blockFriend(req, res, next) {
  try {
    const { userId, friendId } = req.body;
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    return res.status(200).json({ message: 'Friend blocked.' });
  } catch (error) {
    return next(error);
  }
}

async function getPendingFriendRequests(req, res, next) {
  try {
    const requests = await FriendRequest.find({ addresseeId: req.user._id, status: 'pending' });
    res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
}

module.exports = { sendFriendRequest, acceptFriendRequest, blockFriend, getPendingFriendRequests };
