const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  createPaymentIntent,
  retrievePaymentIntent,
} = require("../services/stripeService");

// Create payment intent for a new order
router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amountInCents, "usd", {
      userId: req.user._id.toString(),
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get payment intent status
router.get("/payment-intent/:id", auth, async (req, res) => {
  try {
    const paymentIntent = await retrievePaymentIntent(req.params.id);

    // Only allow users to retrieve their own payment intents
    if (paymentIntent.metadata.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    });
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
