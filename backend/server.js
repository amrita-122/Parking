require('dotenv').config()
const cors = require('cors')
const express = require("express");
const connectDb = require('./config/db')
const authRoutes = require("./routes/auth");

const app = express();

connectDb();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.listen( process.env.PORT , () => console.log("Server running"));

