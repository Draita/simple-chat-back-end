const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;


    // Generate a random 4-digit tag
    let tag;
    let isTagUnique = false;
    while (!isTagUnique) {
      tag = Math.floor(1000 + Math.random() * 9000).toString();
      const existingUser = await User.findOne({ username, tag });
      if (!existingUser) {
        isTagUnique = true;
      }
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      tag,
      email,
      password: hashedPassword,
      active: false,
      blocked: false,
      friends: [],
      messageLists: [],
    });

    // Generate a token and save the user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    user.token = token;
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +token');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = user.token;
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ message: 'Logged in successfully!' });
  } catch (err) {
    next(err);
  }
};



module.exports = { register, login };