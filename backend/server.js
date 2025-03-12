require('dotenv').config()
const cors = require('cors')
const express = require("express");
const connectDb = require('./config/db')
const authRoutes = require("./routes/auth");

const app = express();

connectDb();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen( process.env.PORT , () => console.log("Server running on ",process.env.PORT));

