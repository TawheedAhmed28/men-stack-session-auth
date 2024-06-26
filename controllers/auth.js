const express = require("express")
const router = express.Router()
const User = require("../models/user.js")
const bcrypt = require("bcrypt")

router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs")
})

router.post("/sign-up", async (req, res) => {
    // insert code here :)
    // user sends username, password and password confirmation
    // - check if username is taken, must be unique username
    const userInDatabase = await User.findOne({username: req.body.username})
    if (userInDatabase) {
        return res.send("Username taken.")
    }
    // - check if password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Passwords don't match.")
    }
    // - optional password validation (must contain one special character, must be 8 chars long, etc)
    const hasUpperCase = /[A-Z]/.test(req.body.password)
    // ? This is a regexp, you don't need to learn this. If you want to ever use one, just Google it!
    if (!hasUpperCase) {
        return res.send("Password must contain one uppercase character.")
    }

    if (req.body.password.length < 8) {
        return res.send("Password must be at least 8 characters long.")
    }
    // - if everything checks out, create user
    // use bcrypt to hash the user's password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword
    const user = await User.create(req.body)

    res.send(`Thanks for signing up, ${user.username}!`)
})

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs")
})

router.post("/sign-in", async (req, res) => {
    // code to handle the request:
    // user sends username + password
    // check if the user exists first!
    const userInDatabase = await User.findOne({username: req.body.username})
    // if the user doesn't exist, give a generic failure message, so as not to give away any info unnecessarily
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.")
    }

// okay, the user exists in the DB - let's see if they have the right password. Compare it with the hashed password we stored.

    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        if (!validPassword) {
            return res.send("Login failed. Please try again.")
        }

    req.session.user = {
        username: userInDatabase.username
    }
    
    res.redirect("/")
})

router.get("/sign-out", (req, res) => {
    // insert code here
    req.session.destroy()
    res.redirect("/")
})

module.exports = router
