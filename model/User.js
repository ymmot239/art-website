// user.js
const Mongoose = require("mongoose")
const Youtube = require("./Youtube")

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  code:{
    type: String,
  },  

  youtube:{
    type: Mongoose.Schema.Types.ObjectId,
    ref: Youtube
  }
})

const User = Mongoose.model("user", UserSchema)
module.exports = User