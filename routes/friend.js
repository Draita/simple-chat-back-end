const express = require("express");
const router = express.Router();
const {getPendingFriendRequests,
    sendFriendRequest,
    cancelFriendRequest,
     acceptFriendRequest} = require("../controllers/friendController");


// router.post("/api/friendRequests", function (req, res) {
//   friendController.sendFriendRequest;
// });

// router.post("/api/friendRequests", function (req, res) {
//   friendController.acceptFriendRequest;
// });

// router.get("/block/:userId", function (req, res) {
//   friendController.blockFriend;
// });
router.put('/cancel', cancelFriendRequest);
router.put('/accept', acceptFriendRequest);


router.post('/add', sendFriendRequest);

router.get('/requests', getPendingFriendRequests);


module.exports = router;
