// /routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authenticate = require("../middlewares/authenticate");
const { Payment } = require("../models/payments");

// Create Stripe PaymentIntent
router.post("/create-intent", authenticate, async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json(paymentIntent.client_secret);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/checkout", authenticate, async (req, res) => {
  try {
    const { reservationId, amount, paymentMethod, transactionId } = req.body;

    console.log("📦 Payment data:", req.body);
    console.log("🔐 Authenticated user:", req.user);

    const payment = new Payment({
      userId: req.user.id,
      reservationId,
      amount,
      paymentMethod,
      transactionId,
      status: "completed",
    });

    await payment.save();
    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("❌ Payment save failed:", error.message);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

module.exports = router;
