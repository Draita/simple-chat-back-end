const express = require("express");
const router = express.Router();
const User = require("../models/userModel");



const {getProfilePicture,getLoggedInUser,updateProfile} = require("../controllers/userController");


router.get('/self', getLoggedInUser);

const multer = require('multer');
const upload = multer();

router.post('/update_profile', upload.single('image'), updateProfile);


router.get("/profile_picture/:id", getProfilePicture);









module.exports = router;
