require("dotenv").config()
const job = require('./config/cronJob')
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO).then((val)=> console.log("Database connected...."))
const express = require("express")
const nocache = require("nocache")
const session = require('express-session')
const app = express()
const userRoute = require("./routers/userRouter")
const adminRoute = require("./routers/adminRouter")
const Error404 = require('./middleware/errors')

app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//session
app.use(session({
    secret: "thisiemysecretkey",
    resave: false,
    saveUninitialized: true
}))



app.use(Error404)
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use("/", userRoute)
app.use("/admin", adminRoute)

app.listen(process.env.PORT, () => {
    console.log("server is running...")
});


