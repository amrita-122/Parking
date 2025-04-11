require('dotenv').config()
const cors = require('cors')
const passport = require('passport');
const express = require("express");
const connectDb = require('./config/db')

const authRoutes = require("./routes/auth");
require('./config/passport');
const parkingRoutes = require("./routes/parkingData");
const settings = require("./routes/settings")
const paymentRoutes = require("./routes/payment");
const reservationRoutes = require("./routes/reservationData");
const adminRoutes = require('./routes/admin')


const app = express();

connectDb();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/app/settings",settings)
app.use("/api/payment", paymentRoutes);
app.use("/api/user", reservationRoutes);
app.use("/api/admin", adminRoutes);

app.listen( process.env.PORT , () => console.log("Server running on ",process.env.PORT));

