const FriendRequest = require("../models/friendRequestModel");
const User = require("../models/userModel");
const Friendship = require("../models/FriendshipModel");
const { createPrivateRoom } = require('../services/privateRoomService');
const { emitToUsers } = require('../services/socketUtils');



async function sendFriendRequest(socket, usernameAndTag,io ) {
  try {

    const [username, tag] = usernameAndTag.split("#");
    if (!username || !tag) {
      return socket.emit("friendRequestError", { error: "Invalid username and tag." });
    }

    const addressee = await User.findOne({ username, tag });
    if (!addressee) {
      return socket.emit("friendRequestError", { error: "Addressee not found." });
    }



    const friendRequest = await FriendRequest.create({
      requester: socket.user._id,
      addressee: addressee._id,
      status: "pending"
    });

    console.log("adreesseee: "+ friendRequest.addressee)
    console.log("requester: "+socket.user._id )

    const populatedRequest = await FriendRequest.findOne({ requester: socket.user._id, addressee: friendRequest.addressee,
      status: 'pending' })
  .populate("requester", "username tag")
  .populate("addressee", "username tag");

      const userIDs = [socket.user._id,  addressee._id];

      emitToUsers(io,userIDs, "new friend", populatedRequest)
    // socket.emit("friendRequestSent", populatedRequest);
  } catch (error) {
    console.log(error)
    socket.emit("friendRequestError", { error: error.message });
  }
}

async function acceptFriendRequest(socket, _id,io) {
  try {
    const addressee = socket.user._id;
    const request = await FriendRequest.findOneAndUpdate(
      { _id, addressee, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return socket.emit("friendRequestError", { error: "Friend request not found." });
    }

    const user1 = request.requester;
    const user2 = request.addressee;

    const newRoom = await createPrivateRoom(user1, user2);

    const friendship = await Friendship.create({ user1, user2, room: newRoom._id });
    console.log("accepted")


    const userIDs = [request.addressee, request.requester]
    emitToUsers(io,userIDs, "remove request", request._id)


  } catch (error) {
    socket.emit("friendRequestError", { error: error.message });
  }
}


async function refuseFriendRequest(socket,_id ,io){
  try{
// TODO: fix this
    const addressee = socket.user._id;
    const request = await FriendRequest.findOneAndUpdate(
      { _id, addressee, status: "pending" },
      { status: "refused" },
      { new: true }
    );

    const userIDs = [request.addressee, request.requester]

    emitToUsers(io,userIDs, "remove request", request._id)

  } catch(error){
    console.log(error)
  }
}


async function removeFriendReqeust(socket,_id ,io, newStatus ) {
  try {
    const requester = socket.user._id;
    console.log("ID: "+_id)
    console.log("requester: "+requester)


    const request = await FriendRequest.findOneAndUpdate(
      { _id, requester, status: "pending" },
      { status: newStatus },
      { new: true }
    );
    console.log(request)


    if (!request) {
      return socket.emit("friendRequestError", { error: "Friend request not found." });
    }

    const userIDs = [request.addressee, request.requester]
    console.log(userIDs)

    emitToUsers(io,userIDs, "remove request", request._id)
  } catch (error) {
    console.log(error)
    socket.emit("friendRequestError", { error: error.message });
  }
}

async function blockFriend(socket, { userId, friendId }) {
  try {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    socket.emit("friendBlocked", { message: "Friend blocked." });
  } catch (error) {
    socket.emit("friendRequestError", { error: error.message });
  }
}

async function getPendingFriendRequests(socket) {
  try {
    // Find all incoming friend requests for the current user
    const incomingRequests = await FriendRequest.find({
      addressee: socket.user._id,
      status: "pending",
    }).populate("requester", "username");

    // Find all outgoing friend requests initiated by the current user
    outgoingRequests = await FriendRequest.find({
      requester: socket.user._id,
      status: "pending",
    }).populate("addressee", "username");



    // Combine the incoming and outgoing requests into a single array and emit it to the client
    socket.emit("pending friend requests", [...incomingRequests, ...outgoingRequests]);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  blockFriend,
  getPendingFriendRequests,
  removeFriendReqeust,
  refuseFriendRequest
};
