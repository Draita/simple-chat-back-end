const express = require("express");
const router = express.Router();
const {clearNotification,} = require("../controllers/notificationController");



router.post('/clear', clearNotification);


module.exports = router;
