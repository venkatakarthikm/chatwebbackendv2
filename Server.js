const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const User = require('./models/Users'); // Import your User model
const Chats = require('./models/Chats'); // Import your Chats model

// Connect to MongoDB
const dburl = process.env.mongodburl;
mongoose.connect(dburl)
  .then(() => {
    console.log("Connected to DB Successfully");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
app.use(express.json());
app.use(cors());

// Import and use routes
const userrouter = require("./routes/userroutes");
app.use("", userrouter);

// Set up HTTP server and Socket.io
const port = process.env.PORT || 2032;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://chatwebvk.onrender.com", // Adjust to your frontend origin
    methods: ["GET", "POST"]
  }
});

// Store active users
let activeUsers = {};

// Socket.io logic for handling connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle a new user coming online
  socket.on("newUser", async (username) => {
    activeUsers[socket.id] = username;
    await User.updateOne({ username }, { online: true }); // Update user status
    
    // Emit the list of active users
    const onlineUsers = await User.find({ online: true }).select('username');
    io.emit("activeUsers", onlineUsers.map(user => user.username));
    console.log("New user online:", username);
  });

  // Handle user disconnecting
  socket.on("disconnect", async () => {
    const username = activeUsers[socket.id];
    delete activeUsers[socket.id]; // Remove from active users
    await User.updateOne(
      { username },
      { 
        online: false, 
        lastSeen: new Date() // Update last seen timestamp
      }
    ); // Update user status

    // Emit updated list of active users
    const onlineUsers = await User.find({ online: true }).select('username');
    io.emit("activeUsers", onlineUsers.map(user => user.username));
    console.log("User disconnected:", socket.id, username);
  });

  // Handle message edits
  socket.on("editMessage", async (messageData) => {
    try {
      const { _id, newMsg } = messageData;
      await Chats.updateOne({ _id, deleted: false }, { $set: { msg: newMsg } });
      io.emit("messageUpdated", { _id, newMsg });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });

  // Handle message deletions
  socket.on("deleteMessage", async (messageId) => {
    try {
      await Chats.updateOne({ _id: messageId, deleted: false }, { $set: { deleted: true } });
      io.emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
