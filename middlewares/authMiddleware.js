const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const _id = decodedToken.userId
    const user = await User.findOne({_id, token});

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    console.log("AUTH BRO!!!")

    next();
  } catch (error) {
    res.status(401).send({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;