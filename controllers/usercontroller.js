const Chats = require("../models/Chats");
const Networks = require("../models/Networks");
const Users = require("../models/Users");

const checkuserlogin = async (request, response) => {
  try {
    const input = request.body;
    const users = await Users.findOne(input);
    if (users) {
      // Mark the user as online when they log in
      users.online = true;
      await users.save();
    }
    response.json(users);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

const insertuser = async (request, response) => {
  try {
    const input = request.body;
    const users = new Users(input);
    await users.save();
    response.status(200).send("Registered Successfully");
  } catch (e) {
    response.status(500).send(e.message);
  }
};

const updateuserdata = async (request, response) => {
  try {
    const input = request.body;
    const userid = input.userid;
    const user = await Users.findOne({ userid });

    if (!user) {
      return response
        .status(404)
        .send("User not found with the provided userid");
    }

    for (const key in input) {
      if (key !== "userid" && input[key]) {
        user[key] = input[key];
      }
    }

    await user.save();
    response.status(200).send("User Data Updated Successfully");
  } catch (e) {
    response.status(500).send(e.message);
  }
};

// Controller to handle when a user goes offline and update last seen
const markUserOffline = async (username) => {
  try {
    const user = await Users.findOne({ username });
    if (user) {
      user.online = false;
      user.lastSeen = new Date(); // Update last seen timestamp
      await user.save(); // Save changes
    }
  } catch (error) {
    console.error(`Error marking user ${username} offline:`, error);
  }
};

const connections = async (request, response) => {
  try {
    const searchTerm = request.params.searchTerm;

    const networks = await Networks.find({
      $or: [
        { "user1.username": new RegExp(searchTerm, "i") },
        { "user2.username": new RegExp(searchTerm, "i") },
      ],
    });

    if (networks.length === 0) {
      response.status(200).send("No User found");
    } else {
      const userPromises = networks.map((network) => {
        const otherUsername =
          network.user1.username.toLowerCase() === searchTerm.toLowerCase()
            ? network.user2.username
            : network.user1.username;
        return Users.findOne({ username: otherUsername });
      });

      const users = await Promise.all(userPromises);
      const filteredUsers = users.filter((user) => user !== null);

      if (filteredUsers.length === 0) {
        response.status(200).send("No matching users found in networks");
      } else {
        response.json(filteredUsers);
      }
    }
  } catch (error) {
    response.status(500).send(error.message);
  }
};

const searchuser = async (request, response) => {
  try {
    const searchTerm = request.params.searchTerm;
    const users = await Users.find({ username: new RegExp(searchTerm, "i") });
    if (users.length === 0) {
      response.status(200).send("No User found");
    } else {
      response.json(users);
    }
  } catch (error) {
    response.status(500).send(error.message);
  }
};

const searchconnection = async (request, response) => {
  const { userData, receiverData } = request.body;

  try {
    let networks = await Networks.findOne({
      $or: [
        {
          "user1.username": userData.username,
          "user2.username": receiverData.username,
        },
        {
          "user1.username": receiverData.username,
          "user2.username": userData.username,
        },
      ],
    });

    if (!networks) {
      networks = new Networks({
        user1: userData,
        user2: receiverData,
      });
      await networks.save();
    }
    response.status(200).json(networks);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

const sendmessage = async (request, response) => {
  try {
    const input = request.body;
    const chats = new Chats(input);
    await chats.save();
    response.status(200).send("Sent Successfully");
  } catch (e) {
    response.status(500).send(e.message);
  }
};

const viewchat = async (request, response) => {
  try {
    const networkId = request.params.networkId;
    const messages = await Chats.find({ networkid: networkId });

    if (messages.length === 0) {
      response.status(200).send("No Messages");
    } else {
      response.json(messages);
    }
  } catch (error) {
    console.error(error);
    response.status(500).send(error.message);
  }
};

const updateseen = async (req, res) => {
  try {
    const { _id } = req.params;
    const { readStatus } = req.body;

    const updateResult = await Chats.updateOne(
      { _id: _id },
      { $set: { read: readStatus } }
    );

    if (updateResult.nModified > 0) {
      res
        .status(200)
        .json({ message: "Message read status updated successfully" });
    } else {
      res
        .status(404)
        .json({ message: "Message not found or no update necessary" });
    }
  } catch (error) {
    console.error("Error updating message read status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await Users.find({ online: true }).select("username");
    res.json(onlineUsers.map((user) => user.username));
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const editmessage = async (request, response) => {
  try {
    const { _id, msg } = request.body; // Get message ID and new message text from request body

    const msgToUpdate = await Chats.findById(_id);
    
    if (!msgToUpdate) {
      return response.status(404).send("Message not found with the provided id");
    }

    msgToUpdate.msg = msg; // Update the message text

    await msgToUpdate.save();
    response.status(200).send("Message updated successfully");
  } catch (e) {
    response.status(500).send(e.message);
  }
};



const deletemessage = async (request, response) => {
  try {
    const { _id } = request.params;

    const deletedMessage = await Chats.findByIdAndDelete(_id);

    if (!deletedMessage) {
      return response.status(404).send("Message not found");
    }

    response.status(200).send("Message deleted successfully");
  } catch (error) {
    console.error("Error deleting message:", error);
    response.status(500).send(error.message);
  }
};

module.exports = {
  checkuserlogin,
  insertuser,
  searchuser,
  searchconnection,
  sendmessage,
  viewchat,
  updateseen,
  connections,
  getOnlineUsers,
  markUserOffline,
  updateuserdata,
  editmessage,
  deletemessage,
};
