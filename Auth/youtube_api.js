const {google} = require('googleapis');
const querystring = require('node:querystring'); 
const jwt = require('jsonwebtoken')
const jwtSecret = "1b127d621c1934040762e00af1e61bbdbd86a65d9405b99c1d766bd3f080aac163c3c2"
const User = require("../model/User");
const Youtube = require("../model/Youtube");


const oauth2Client = new google.auth.OAuth2(
    "",
    "",
    "http://localhost:5000/api/token/youtube_callback"
  );

// Access scopes for read-only Drive activity.
const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
];
exports.youtube_api = async (req, res, next) => {
    var _code
    const token = req.cookies.jwt
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        User.findById(decodedToken.id)
        .then((user)=>{
            var _code
            if(user.code){
                _code = user.code
            } else {
                user.code = Math.random().toString(36).substring(2,15);
                user.save()
                _code = user.code
                console.log(user.code)
            }
            const authorizationUrl = oauth2Client.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',
                /** Pass in the scopes array defined above.
                 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
                scope: scopes,
                // Enable incremental authorization. Recommended as a best practice.
                include_granted_scopes: true,
        
                state:_code
        
            });  
            return res.status(200).json({youtube_url:authorizationUrl});
        }).catch((error) => {
            return res
              .status(400)
              .json({ message: "An error occurred", error: error.message });
        });
      }
    })
}

exports.youtube_callback = async (req, res, next) => {

    var _code = req.query.code || null;
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
            if(!user.youtube){
                const you = Youtube.create({
                    code:_code,
                })
                user.youtube = y_id
                user.save()
            }
            Youtube.findById(user.youtube)
            .then((youtube)=>{
                youtube.code = _code
            })
            
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