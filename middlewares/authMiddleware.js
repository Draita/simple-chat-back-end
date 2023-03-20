const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const _id = decodedToken.userId;
    const user = await User.findOne({ token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ error: "Authentication failed" });
  }
};

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie.split("=")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.userId;
    const user = await User.findOne({ _id: userId, token });

    if (!user) {
      throw new Error();
    }

    socket.user = user;
    next();
  } catch (error) {
    socket.disconnect();
  }
};

module.exports = { authMiddleware, socketAuthMiddleware };
