const mongoose = require("mongoose");

// Define the user schema
const usersschema = new mongoose.Schema({
    profilename: {
        type: String,
        required: true
    },
    imagelink: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    userid: {
        type: Number,
        required: true,
        unique: true,
        default: () => generateRandomId()
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: "pk100share"
    },
    online: { // Field to track online status
        type: Boolean,
        default: false
    },
    lastSeen: { // Field to track last seen timestamp
        type: Date,
        default: null
    }
});

// Function to generate a random user ID
function generateRandomId() {
    return Math.floor(Math.random() * 900000) + 100000;
}

// Add pre-save middleware to update lastSeen if the user goes offline
usersschema.pre('save', function(next) {
    if (!this.online && this.isModified('online')) {
        this.lastSeen = new Date();
    }
    next();
});

// Create the model
const Users = mongoose.model('Users', usersschema);

module.exports = Users;
