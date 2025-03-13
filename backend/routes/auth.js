const express = require("express");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const passport = require("passport");

router.post("/signup", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;

    const hashedPass = await bcryptjs.hash(password, 10);

    const user = await User.findOne({ email });
    if (user) {
      res.status(409).json({ message: "Email already Exists!" });
    } else {
      const user1 = new User({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        password: hashedPass,
      });
      await user1.save();
      const token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(201).json({ message: "User Created Successfully!", token });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailorPhone, password } = req.body;
    if (!emailorPhone || !password) {
      return res
        .status(400)
        .json({ message: "Email/Phone and password are required!" });
    }
    const user = await User.findOne({
      $or: [{ email: emailorPhone }, { phoneNumber: emailorPhone }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(200).json({ message: "Login Successful!", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`http://localhost:5173/?token=${req.user.token}`);
  }
);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
        options: {
          ignoreExpiration: false,
          maxExpiry: 5 * 60,
        },
      });

      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name,
          provider: "google",
          password: null,
          role: "user",
        });
        await user.save();
      }
      const jwtToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET
      );

      res.json({ token: jwtToken, user });
    } catch (verifyError) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

module.exports = router;
