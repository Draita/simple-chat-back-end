const Notification = require('../models/notificationModel');


async function clearNotification(req, res, next) {
    try {
      console.log("clear")
        const notification = await Notification.findById(req.body.notificationId);

        if (!notification) {
          return res.status(404).json({ error: 'Notification not found' });
        }


        notification.isActive = false;
        notification.messageCount = 0;
        notification.notificationMessage = "";
        await notification.save();

        return res.json(notification);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
}

module.exports = {
    clearNotification,
};
