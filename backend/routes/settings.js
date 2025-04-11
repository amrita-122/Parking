const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User model

// GET route to fetch user info
router.get("/settings", async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Assuming you have user authentication
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT route to update user info
router.put("/settings", async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phoneNumber },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
