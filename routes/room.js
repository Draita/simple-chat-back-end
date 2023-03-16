const express = require("express");
const router = express.Router();
const {getRoomList} = require("../controllers/roomController");


const {getLoggedInUser} = require("../controllers/userController");


router.get('/self', getLoggedInUser);

router.get('/list', getRoomList);


module.exports = router;
