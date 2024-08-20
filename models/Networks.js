const mongoose = require("mongoose");

const networksschema = new mongoose.Schema({
  networkid: {
    type: Number,
    required: true,
    unique: true,
    default: () => generateRandomId()
  },
  user1: {
    type: Object,
    required: true
  },
  user2: {
    type: Object,
    required: true
  }
});

const Networks = mongoose.model('Networks', networksschema);

function generateRandomId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

module.exports = Networks;
