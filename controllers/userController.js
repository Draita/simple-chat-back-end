const User = require("../models/userModel");
var sizeOf = require("buffer-image-size");

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // SET PROFILE PICTURE
    try{
      if (req.file.buffer) {
        const buffer = req.file.buffer;
        var dimensions = sizeOf(buffer);
        if (
          dimensions.height == 256 &&
          dimensions.width == 256 &&
          dimensions.type == "jpg"
        ) {
          user.profilePicture = req.file.buffer;
        }
      }

    } catch{
      // no profile picture that's alright
    }


    if (req.body.username) {
      user.username = req.body.username;
    }

    if (req.body.tag) {
      user.tag = req.body.tag;
    }

    await user.save();

    return res.status(200).send(user);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

const getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Unable to retrieve user" });
  }
};

const getProfilePicture = async (req, res) => {
  try {
    console.log(req.params.id);

    const user = await User.findById(req.params.id).select("+profilePicture ");
    if (!user || !user.profilePicture) {
      return res.status(404).send("Profile picture not found");
    }
    res.set("Content-Type", "image/jpeg");
    res.send(user.profilePicture);
  } catch (error) {
    res.status(500).send("Unable to retrieve profile picture");
  }
};

module.exports = {
  getLoggedInUser,
  updateProfile,
  getProfilePicture,
};
