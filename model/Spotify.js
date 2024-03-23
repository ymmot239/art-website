// spotify.js
const Mongoose = require("mongoose")

const SpotifySchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  code: {
    type: String,
    default: "",
    required: false,
  }
  
  
})

const User = Mongoose.model("spotify", SpotifySchema)
module.exports = User