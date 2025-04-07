const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");

// Get reviews for a product (public route)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews by a user (requires auth)
router.get("/user", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a review (requires auth and purchase verification)
router.post("/:productId", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify the user has purchased this product AND the order is delivered
    const hasPurchased = await Order.exists({
      user: req.user._id,
      "items.product": productId,
      status: "delivered", // Only delivered orders qualify
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can only review products from delivered orders",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // Create the review
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    // Populate user data
    await review.populate("user", "username");

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a review (owner only)
router.put("/:reviewId", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    review.rating = rating;
    review.comment = comment;

    await review.save();

    // Populate user data
    await review.populate("user", "username");

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a review (owner or admin)
router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify ownership or admin role
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
