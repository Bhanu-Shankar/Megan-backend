const registerModal = require('../models/register');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
require('dotenv').config()






class Users {

    register = (req, res) => {
        const { userName, email, password, confirmPass } = req.body
        console.log("====req.body", req.body)
        if (password !== confirmPass) {
            res.json({ status: false, message: "Confirm Password didn't match" })
        } else {
            registerModal.findOne({ email: email }).then(async (respdata) => {
                console.log(respdata)
                if (respdata) {
                    res.json({ status: false, message: "User already exist" })
                } else {
                    var newuser = new registerModal({
                        userName: userName,
                        email: email,
                        password: await bcrypt.hashSync(password, saltRounds),
                        confirmPass: confirmPass
                    })

                    newuser.save().then((resps) => {
                        console.log("=====", resps)
                        if (resps) {
                            res.json({ status: true, message: "Signup sucessfull",data:resps })
                        } else {
                            res.json({ status: false, message: "Signup failed,Try again" })
                        }
                    })
                }
            }).catch((errs) => {
                console.log(errs)
                res.json({ status: false, message: "Something went wrong" })
            })
        }
    }


    login = (req, res) => {
        const { email, password } = req.body
        console.log("req.body====", req.body)

        registerModal.findOne({ email: email }).then(async (respp) => {
            console.log("respppp=========", respp)
            if (respp) {
                const match = await bcrypt.compare(password, respp.password);
                if (match) {
                    var token = jwt.sign({ email: respp.email }, process.env.SECRETKEY_JWT);
                    var myquery = { email: email };
                    var newvalues = { $set: { token: token } };
                    registerModal.findOneAndUpdate(myquery, newvalues, function (err, respo) {
                        if (err) {
                            res.json({ status: false, message: "token not saved" })
                        } else {
                            res.json({ status: true, message: "Login successful.", token: token })
                        }
                    })
                } else {
                    res.json({ status: false, message: "email and password is incorrect" })
                }
            } else {
                res.json({ status: false, message: "User not found" })
            }
        }).catch((errss) => {
            console.log('errss', errss)
        })
    }
}

module.exports = new Users()
