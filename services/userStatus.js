const User = require("../models/userModel");

const isUserOnline = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  return user.isOnline;
};

const getConnectedSockets = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  return user.connectedSockets || [];
};


const clearConnectedSockets = async () => {
    try {
      await User.updateMany({}, { connectedSockets: [] });
      console.log('Connected sockets cleared for all users');
    } catch (err) {
      console.error('Error clearing connected sockets:', err);
    }
  };



module.exports = { isUserOnline, getConnectedSockets,clearConnectedSockets };
