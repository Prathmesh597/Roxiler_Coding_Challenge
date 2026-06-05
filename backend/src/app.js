const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

//Load .env file
dotenv.config();

//Express application instance
const app = express();

//middlewares
app.use(cors()); // frontend on - port 3000 & backend on - port 5000, browswer will not request
app.use(express.json()); //convert incoming data into json format

app.get("/", (req,res) =>{
    res.json({
        message: "API is running"
    });
});

module.exports = app;
