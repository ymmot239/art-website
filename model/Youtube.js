// spotify.js
const Mongoose = require("mongoose")

const YoutubeSchema = new Mongoose.Schema({
  code: {
    type: String,
    default: "",
    required: false,
  }
  
})

const Youtube = Mongoose.model("youtube", YoutubeSchema)
module.exports = Youtube