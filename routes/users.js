var express = require('express');
var router = express.Router();
const controllers = require('../controllers/users')
const registerModal = require("../models/register");
require('dotenv').config();
const jwt = require('jsonwebtoken');


verifytoken = (req, res, next) => {
  console.log("req.headers", req.headers)
  var token = req.headers.authtoken
  console.log("tokenvalue===",token)
  if (token) {
      jwt.verify(token, process.env.SECRETKEY_JWT, function (err, respData) {
          if (err) {
            console.log("ifcaseverifytoken",err)
           return res.json({ status: false, message: "Your session has expired! Please login again" })
          } else {
              console.log("decoded", respData.email);
              var email = respData.email;
              registerModal.findOne({ email: email }).then((response) => {
                  console.log('email founde by token', response);
                  if (response == null || response == "") {
                      return res.json({status:false,message:"User not found"})
                  }else{
                    req.currentuser = response;
                    console.log("cureent user", req.currentuser);
                    next()
                  }
              }).catch((err) => {
                  return res.json({status:false,message:"Something went wrong"})
              });
          }
      });

  } else {
      console.log("elsecase")
      return res.json({status:false,message:"Authorization failed."})
  }
}



//backend api routes
router.post('/register', controllers.register);
router.post('/login', controllers.login)

module.exports = router;
