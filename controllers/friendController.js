const FriendRequest = require("../models/friendRequestModel");
const User = require("../models/userModel");
const Friendship = require("../models/FriendshipModel");
const { createPrivateRoom } = require('../services/privateRoomService');





async function sendFriendRequest(req, res, next) {
  try {
    console.log("bro")
    const requesterId = req.user._id;
    const { usernameAndTag } = req.body;
    const [username, tag] = usernameAndTag.split("#");

    if (!username || !tag) {
      return res.status(400).json({ error: "Invalid username and tag." });
    }

    const addressee = await User.findOne({ username, tag });
    if (!addressee) {
      return res.status(404).json({ error: "Addressee not found." });
    }


    const request = await FriendRequest.create({
      requester: requesterId,
      addressee: addressee._id,
      status: "pending"
    });

    const populatedRequest = await FriendRequest.findById(request._id)
      .populate("requester", "username tag")
      .populate("addressee", "username tag");

    return res.status(201).json(populatedRequest);
  } catch (error) {
    return next(error);
  }
}

async function acceptFriendRequest(req, res, next) {
  try {
    const { requester } = req.body;
    const addressee = req.user._id;

    const request = await FriendRequest.findOneAndUpdate(
      { requester, addressee, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found." });
    }

    const user1 = request.requester;
    const user2 = request.addressee;

    const newRoom = await createPrivateRoom(user1, user2);

    const friendship = await Friendship.create({ user1, user2, room: newRoom._id });

    return res
      .status(200)
      .json({ message: "Friend request accepted successfully.", friendship });
  } catch (error) {
    return next(error);
  }
}

async function cancelFriendRequest(req, res, next) {
  try {
    const { addressee } = req.body;
    const requester = req.user._id;

    const request = await FriendRequest.findOneAndUpdate(
      { requester, addressee, status: "pending" },
      { status: "cancelled" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found." });
    }

    return res.status(200).json({ message: "Friend request cancelled." });
  } catch (error) {
    return next(error);
  }
}

async function blockFriend(req, res, next) {
  try {
    const { userId, friendId } = req.body;
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    return res.status(200).json({ message: "Friend blocked." });
  } catch (error) {
    return next(error);
  }
}

async function getPendingFriendRequests(req, res, next) {
  try {
    // Find all incoming friend requests for the current user
    const incomingRequests = await FriendRequest.find({
      addressee: req.user._id,
      status: "pending",
    }).populate("requester", "username");

    // Map the incoming requests to include a flag for whether they are incoming or outgoing
    const updatedIncomingRequests = incomingRequests.map((request) => ({
      ...request.toObject(),
      isIncoming: true,
    }));

    // Find all outgoing friend requests initiated by the current user
    const outgoingRequests = await FriendRequest.find({
      requester: req.user._id,
      status: "pending",
    }).populate("addressee", "username");

    // Map the outgoing requests to include a flag for whether they are incoming or outgoing
    const updatedOutgoingRequests = outgoingRequests.map((request) => ({
      ...request.toObject(),
      isIncoming: false,
    }));

    // Combine the incoming and outgoing requests into a single array and send it as the response
    res
      .status(200)
      .json([...updatedIncomingRequests, ...updatedOutgoingRequests]);
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  blockFriend,
  getPendingFriendRequests,
  cancelFriendRequest,
};
