const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");



//Load .env file
dotenv.config();

const db = require("./config/db");
const authRoutes = require("./routes/auth.routes");

//Express application instance
const app = express();

//middlewares
app.use(cors()); // frontend on - port 3000 & backend on - port 5000, browswer will not request
app.use(express.json()); //convert incoming data into json format

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/user", userRoutes);



app.get("/", (req,res) =>{
    res.json({
        message: "API is running"
    });
});

module.exports = app;
