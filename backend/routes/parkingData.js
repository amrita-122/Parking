const express = require("express");
const { ParkingSpot, Reservation } = require("../models/parking_db");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { Payment } = require("../models/payments"); // ✅ Add this

router.post("/add", async (req, res) => {
  try {
    const { lotNumber, spotNumber, lat, lng } = req.body;
    if (!lotNumber || !spotNumber || !lat || !lng) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSpot = await ParkingSpot.findOne({ spotNumber });
    if (existingSpot) {
      return res.status(400).json({ message: "Spot already exists!" });
    }

    const newSpot = new ParkingSpot({
      lotNumber,
      spotNumber,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    await newSpot.save();
    res.status(201).json({ message: "Parking spot added!", spot: newSpot });
  } catch (error) {
    console.error("🚨 Spot Add Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await ParkingSpot.findByIdAndDelete(req.params.id);
    res.json({ message: "Spot deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Get All Parking Spots
router.get("/all", async (req, res) => {
  try {
    const spots = await ParkingSpot.find();
    res.status(200).json(spots);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/reserve", authenticate, async (req, res) => {
  try {
    const { spotId, startTime, endTime } = req.body;
    const userId = req.user.id;
     const spot = await ParkingSpot.findById(spotId);
     if (!spot || !spot.isAvailable) {
       return res.status(400).json({ message: "Spot is not available!" });
     }

    const now = new Date();
    const maxReserveTime = new Date(now.getTime() + 20 * 60 * 1000);
    if (new Date(startTime) > maxReserveTime) {
      return res.status(400).json({
        message: "Reservation must be within 20 minutes from now.",
      });
    }
    const hasPaid = await Payment.findOne({
        userId,
        amount: { $gt: 0 },
        status: "completed",
      }).sort({ timestamp: -1 }); // <-- ensure latest one is considered
      
    if (!hasPaid) {
      return res.status(403).json({
        message: "Please complete a payment before reserving.",
      });
    }
   
    // Create reservation
    const reservation = new Reservation({
      userId,
      spotId,
      startTime,
      endTime,
      status: "reserved",
    });

    await reservation.save();
    await ParkingSpot.findByIdAndUpdate(spotId, {
      isAvailable: false,
      reservedBy: userId,
    });

    res
      .status(201)
      .json({ message: "Spot reserved successfully!", reservation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// 4️⃣ Check-in to a Reserved Spot
router.post("/checkin", async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation || reservation.status !== "reserved") {
      return res.status(400).json({ message: "Invalid reservation!" });
    }

    reservation.status = "checked-in";
    await reservation.save();
    res.status(200).json({ message: "Checked in successfully!", reservation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// 5️⃣ Check-out from a Spot
router.post("/checkout", async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation || reservation.status !== "checked-in") {
      return res.status(400).json({ message: "Invalid reservation!" });
    }

    reservation.status = "completed";
    await reservation.save();
    await ParkingSpot.findByIdAndUpdate(reservation.spotId, {
      isAvailable: true,
      reservedBy: null,
    });

    res.status(200).json({ message: "Checked out successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;


router.get("/nearest", authenticate, async (req, res) => {
    const { lat, lng } = req.query;
  
    if (!lat || !lng) {
      return res.status(400).json({ message: "Missing coordinates" });
    }
  
    const spots = await ParkingSpot.find({ isAvailable: true });
  
    if (!spots.length) {
      return res.status(404).json({ message: "No spots available" });
    }
  
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
  
    const nearest = spots.reduce((closest, spot) => {
      const d1 = Math.sqrt((spot.lat - userLat) ** 2 + (spot.lng - userLng) ** 2);
      const d2 = Math.sqrt((closest.lat - userLat) ** 2 + (closest.lng - userLng) ** 2);
      return d1 < d2 ? spot : closest;
    });
  
    res.json(nearest);
  });

  router.get("/nearby", async (req, res) => {
    const { lat, lng, radius = 0.5 } = req.query; // radius in KM
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
  
    if (!latNum || !lngNum) {
      return res.status(400).json({ message: "Missing lat/lng" });
    }
  
    // Convert radius to degrees roughly (1km ≈ 0.009 degrees)
    const delta = parseFloat(radius) * 0.009;
  
    const spots = await ParkingSpot.find({
      lat: { $gte: latNum - delta, $lte: latNum + delta },
      lng: { $gte: lngNum - delta, $lte: lngNum + delta },
    });
  
    res.json(spots);
  });
  
  