const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const _id = decodedToken.userId;
    const user = await User.findOne({ token });
    console.log("correctToken: ", decodedToken );

    if (!user) {
      console.log("--------------------");

      console.log("wrongToken: ", decodedToken );

      throw new Error();
    }

    req.token = token;
    req.user = user;
    console.log("AUTH BRO!!!");

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
    console.log("Socket authenticated");
    next();
  } catch (error) {
    console.log("Socket authentication failed");
    socket.disconnect();
  }
};

module.exports = { authMiddleware, socketAuthMiddleware };
