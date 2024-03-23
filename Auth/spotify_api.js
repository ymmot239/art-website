const client_id = "";
client_secret = "";
var redirect_uri = 'http://localhost:5000/api/token/spotify_callback';
const querystring = require('node:querystring'); 
const jwt = require('jsonwebtoken')
const jwtSecret = "1b127d621c1934040762e00af1e61bbdbd86a65d9405b99c1d766bd3f080aac163c3c2"
const User = require("../model/User");

exports.spotify_api = async (req, res, next) => {
  let { state } = req.body
  var scope = 'user-read-private user-read-email user-top-read user-read-recently-played user-library-read';
  console.log(state);
  var url = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: false,
    });
  return res.status(200).json({spotify_url:url});
}

exports.spotify_callback = async (req, res, next) => {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/basic' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    
    const token = req.cookies.jwt
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        User.findById(decodedToken.id)
        .then((user) => {
          user.spotify_api = code;
          user.save(); 
        }).catch((error) => {
          res
            .status(400)
            .json({ message: "An error occurred", error: error.message });
        });
      }
    })
    console.log(code);
    res.redirect('/basic');
  }
}

exports.spotify_get = async (req, res, next) => {
  const token = req.cookies.jwt
  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Not authorized" })
    } else {
      User.findById(decodedToken.id)
        .then((user) => {
          const code = user.spotify_api;
          
        }).catch((error) => {
          res
            .status(400)
            .json({ message: "An error occurred", error: error.message });
      });
    }
  })
}

async function getAccessToken(code){
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };
  return new Promise((resolve, reject) => {
    post(authOptions, function (error, response, body) {
      if(error){
        reject(error);
      } else if (response.statusCode === 200) {
        const token = body.access_token;
        resolve(token);
      }
    });
  });
}

async function getProfile(accessToken) {

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  return data;
}

async function getTopItems(accessToken) {

  const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  return data;
}