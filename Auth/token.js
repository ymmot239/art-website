const express = require("express")
const router = express.Router()


//const { spotify_api, spotify_callback } = require("./spotify_api")

//router.route("/spotify_api").post(spotify_api);
//router.route("/spotify_callback").get(spotify_callback);

const { youtube_api, youtube_callback } = require("./youtube_api")

router.route("/youtube_api").get(youtube_api);
router.route("/youtube_callback").get(youtube_callback);
module.exports = router