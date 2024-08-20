const usercontroller = require("./controllers/usercontroller")

const express = require("express")
const router = express.Router()

router.post("/checkuserlogin",usercontroller.checkuserlogin)
router.post("/insertuser",usercontroller.insertuser)

router.put("/updateuserdata", usercontroller.updateuserdata)
router.get("/searchuser/:searchTerm",usercontroller.searchuser)
router.post("/searchconnection/",usercontroller.searchconnection)

router.post("/sendmessage",usercontroller.sendmessage)
router.get("/viewchat/:networkId",usercontroller.viewchat)

router.post("/updateseen/:_i",usercontroller.updateseen)
router.get("/connections/:searchTerm", usercontroller.connections)

router.put('/editmessage', usercontroller.editmessage);
router.delete('/deletemessage/', usercontroller.deletemessage);

module.exports = router