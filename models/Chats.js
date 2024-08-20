const mongoose = require("mongoose");
const moment = require('moment-timezone');


const chatsschema = new mongoose.Schema({
    msgid:{
        type: Number,
        required: true,
        unique: true,
        default: () => generateRandomId()
    },
    networkid: {
      type: String,
      required: true,
    },
    sender: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    msgtime: {
        type: String,
        default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss A')
    },
    read: {
        type: Boolean,
        default: false // Default value for read field
    }

  });

  function generateRandomId() {
    return Math.floor(Math.random() * 900000) + 100000;
}

  const Chats = mongoose.model('Chats',chatsschema);

  module.exports = Chats;