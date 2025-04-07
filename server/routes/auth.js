const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { auth } = require("../middleware/auth");

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.active) {
      console.log(`Account is disabled: ${email}`);
      return res.status(400).json({ message: "Account is disabled" });
    }

    // Compare password directly with bcrypt
    console.log(`Password from request: ${password}`);
    console.log(`Stored hashed password: ${user.password}`);

    // Use bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`Invalid password for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log(`Login successful for: ${email} with role: ${user.role}`);

    // Send response with ALL necessary user fields
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    // Hash password directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    // Instead of returning req.user directly, fetch the full user with all fields
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean() // Use lean() for better performance and to ensure proper JSON conversion
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Explicitly structure the response to ensure all fields are included
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    // Get current user from database to ensure we have the latest data
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username already exists (if changed)
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Check if email already exists (if changed)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    user.username = username;
    user.email = email;

    // If changing password
    if (newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Save user
    await user.save();

    // Return updated user data without password
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user address
router.put("/address", auth, async (req, res) => {
  try {
    const { street, city, postalCode, country } = req.body;

    // In a real app, we'd update or create an address record
    // For now, we'll just return success
    res.json({ message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
