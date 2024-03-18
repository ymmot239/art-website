const express = require("express")
const router = express.Router()
const { register, login, deleteUser, getUsers, getSelf} = require("./Auth");

router.route("/register").post(register)
router.route("/login").post(login);
router.route("/getUsers").get(getUsers);
router.route("/getSelf").get(getSelf);

const { adminAuth } = require("../middleware/auth")

//router.route("/update").put(adminAuth, update)
router.route("/deleteUser").delete(adminAuth, deleteUser)

module.exports = router