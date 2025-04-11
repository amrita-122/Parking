const express = require("express");
const router = express.Router();
const { Reservation, ParkingSpot } = require("../models/parking_db");
const authenticate =  require('../middlewares/authenticate')
const { Payment } = require("../models/payments");

router.get("/reservations", authenticate, async (req, res) => {
    try {
      const reservations = await Reservation.find({ userId: req.user.id }).populate("spotId");
      res.status(200).json(reservations);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  router.get("/payments", authenticate, async (req, res) => {
    const payments = await Payment.find({ userId: req.user.id });
    res.json(payments);
  });


// Reserve a parking spot
router.post("/reserve", async (req, res) => {
    try {
        const { userId, spotId, startTime, endTime } = req.body;

        // Check if spot is available
        const spot = await ParkingSpot.findById(spotId);
        if (!spot || !spot.isAvailable) {
            return res.status(400).json({ error: "Spot not available" });
        }

        // Create reservation
        const reservation = new Reservation({ userId, spotId, startTime, endTime });
        await reservation.save();

        // Mark spot as reserved
        await ParkingSpot.findByIdAndUpdate(spotId, { isAvailable: false, reservedBy: userId });

        res.status(201).json({ message: "Reservation successful", reservation });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Cancel reservation
router.delete("/cancel/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Mark spot as available again
        await ParkingSpot.findByIdAndUpdate(reservation.spotId, { isAvailable: true, reservedBy: null });

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: "Reservation cancelled" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
