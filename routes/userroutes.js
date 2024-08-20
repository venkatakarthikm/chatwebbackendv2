const express = require("express");
const usercontroller = require("../controllers/usercontroller");

const userrouter = express.Router();

userrouter.post("/checkuserlogin", usercontroller.checkuserlogin);
userrouter.post("/insertuser", usercontroller.insertuser);

userrouter.put("/updateuserdata", usercontroller.updateuserdata);
userrouter.get("/searchuser/:searchTerm", usercontroller.searchuser);

userrouter.post("/searchconnection", usercontroller.searchconnection);
userrouter.post("/sendmessage", usercontroller.sendmessage);

userrouter.get("/viewchat/:networkId", usercontroller.viewchat);
userrouter.get("/connections/:searchTerm", usercontroller.connections);

// Route to get all online users
userrouter.get("/users/status", usercontroller.getOnlineUsers);
userrouter.post("/updateseen/:_i", usercontroller.updateseen);

userrouter.put('/editmessage', usercontroller.editmessage);
userrouter.delete('/deletemessage/:_id', usercontroller.deletemessage);

module.exports = userrouter;
