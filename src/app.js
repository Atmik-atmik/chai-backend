import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit : "16kb"})) // It allows your server to read data sent from HTML form submissions (URL-encoded data)
app.use(express.static("public"))
app.use(cookieParser())

export {app}