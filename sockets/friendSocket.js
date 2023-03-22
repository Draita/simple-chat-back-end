const {
  sendFriendRequest,
  acceptFriendRequest,
  blockFriend,
  getPendingFriendRequests,
  removeFriendReqeust,
  refuseFriendRequest,
} = require("../controllers/friendController");

module.exports = (io,socket) => {
  socket.on("send friend request", async (friend) => {
    console.log("send")
    await sendFriendRequest(socket, friend,io);
  });

  socket.on("accept friend reqeust", async (requester) => {
    await acceptFriendRequest(socket, requester,io);
  });

  socket.on("block friend", async (userId, friendId) => {
    await blockFriend(socket, userId, friendId);
  });

  socket.on("get pending friend requests", () => {
    console.log("friend reqeusts")
    getPendingFriendRequests(socket);
  });

  socket.on("cancel friend request", (requestID) => {
    console.log("cancel")

    removeFriendReqeust(socket,requestID,io,"cancelled");
  });

  socket.on("refuse friend request", (requestID) => {
    console.log("broo")
    console.log(requestID)
    refuseFriendRequest(socket,requestID,io);
  });
};
