const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/review");
const paymentRoutes = require("./routes/payment");
const settingsRoutes = require("./routes/settings");
const uploadRoutes = require("./routes/upload");

// API routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);
app.use("/payment", paymentRoutes);
app.use("/settings", settingsRoutes);
app.use("/upload", uploadRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log(`Database URI: ${process.env.MONGO_URI}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Check JWT Secret
if (!process.env.JWT_SECRET) {
  console.error("WARNING: JWT_SECRET is not defined in environment variables");
} else {
  console.log("JWT_SECRET is properly configured");
}

// Check Stripe Secret Key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "WARNING: STRIPE_SECRET_KEY is not defined in environment variables",
  );
} else {
  console.log("STRIPE_SECRET_KEY is properly configured");
}

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});
