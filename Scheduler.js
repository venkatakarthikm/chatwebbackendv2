const cron = require('node-cron');
const Chats = require("../models/Chats");

// Schedule a job to run every minute
cron.schedule('* * * * *', async () => {
  try {
    // Find scheduled messages that need to be sent
    const scheduledMessages = await Chats.find({ scheduled: { $lte: new Date() }, sent: false });

    for (const message of scheduledMessages) {
      // Send the message logic here, e.g., emit via socket.io or some other method
      console.log(`Sending scheduled message: ${message._id}`);
      // Mark as sent
      message.sent = true;
      await message.save();
    }
  } catch (error) {
    console.error('Error in scheduler:', error);
  }
});
