// routes/admin.js
const express = require("express");
const { Reservation } = require("../models/parking_db");
const { Payment } = require('../models/payments')
const router = express.Router();
const authenticate = require("../middlewares/authenticate");

router.get("/reservations", authenticate, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const reservations = await Reservation.find().populate("userId").populate("spotId");
    res.json(reservations);
  });

  router.get("/payments", authenticate, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const payments = await Payment.find().populate("userId").populate("reservationId");
    res.json(payments);
  });

  module.exports = router;
