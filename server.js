// * Make environment variables available when we use our app

const dotenv = require("dotenv")
dotenv.config()

// * import express and create an express instance

const express = require("express")
const app = express()

const mongoose = require("mongoose")
const methodOverride = require("method-override")
const morgan = require("morgan")

// * import express-session to save session data

const session = require("express-session")

// * import auth controller fron auth.js file

const authController = require("./controllers/auth.js")

const port = process.env.PORT ? process.env.PORT : 3000

// ? Ternary statements work as follows: anything before the question mark is what you're asking about ie. "Hey, does this exist? Is this equal to true?". Before the colon is the response if true, after the colon is the response if false. Here, it is saying "if process.env.PORT exists, make port equal to that, and if it doesn't, make port equal to 3000".

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}!`)
})

// * Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({extended: false}))

// * Middleware for using HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(methodOverride("_method"))

// * Morgan for logging HTTP requests
app.use(morgan("dev"))

// * use sessions for auth
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}))

// ? Use the auth controller for any requests that start with /auth
app.use("/auth", authController)

// * GET request:

app.get("/", async (req, res) => {
    res.render("index.ejs", {user: req.session.user})
})

// * Signed-in specific features:

app.get("/vip-lounge", (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the fantasy zone, ${req.session.user.username}.`)
    } else {
        res.send("No account-less peasants allowed. >:(")
    }
})

// * Listen for incoming requests
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}`)
})