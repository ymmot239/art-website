const User = require("../model/User");
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const jwtSecret = "1b127d621c1934040762e00af1e61bbdbd86a65d9405b99c1d766bd3f080aac163c3c2"

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

exports.register = async (req, res, next) => {
  let { username, password } = req.body
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" })
  }
  
  const user = await User.findOne({ username, password })
  if(user){
    return res.status(422).json({ message: "user already exists" })
  }
  try {
    bcrypt.hash(password, 10).then(async(hash)=>{
     await User.create({
       username,
       password: hash,
     }).then(user => {
       const maxAge = 3*60*60;
       
       const token = jwt.sign(
         { id: user._id, username, role:user.role },
         jwtSecret,
         { expiresIn: maxAge,}
       );
       
       res.cookie("jwt", token, {
         httpOnly:true,
         maxAge: maxAge * 1000,
       });

       res.status(200).json({
         message: "User successfully created",
         user,
       });
     })
    })
  } catch (err) {
    res.status(401).json({
      message: "User not successful created",
      error: err.mesage,
    })
    console.log(err);
  }
}

exports.login = async (req, res, next) => {
  const { username, password } = req.body
  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    })
  }
  try {
    const user = await User.findOne({ username })
    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      })
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result){
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, username, role:user.role },
            jwtSecret,
            { expiresIn: maxAge,}
          );
          res.cookie("jwt", token, {
            httpOnly:true,
            maxAge: maxAge * 1000,
          });

          res.status(200).json({
            message: "Login successful",
            user: user._id,
            role: user.role,
          })

        } else {
          res.status(400).json({ message: "Login not succesful" })
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    })
  }
}

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body
  await User.findByIdAndDelete(id)
    .then(user =>
      res.status(201).json({ message: "User successfully deleted", user })
    )
    .catch(error =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    )
}

exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then(users => {
      const userFunction = users.map(user => {
        const container = {}
        container.username = user.username
        container.role = user.role
        container._id= user._id
        return container
      })
      res.status(200).json({ user: userFunction })
    })
    .catch(err =>
      res.status(401).json({ message: "Not successful", error: err.message })
    )
}

exports.getSelf = async (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        return res.status(200).json({username:decodedToken.username})
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}
