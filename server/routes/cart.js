const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

// Get user cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name imageUrl",
    });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], total: 0 });
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], total: 0 });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    // Calculate new total quantity (existing + new)
    let newTotalQuantity = quantity;
    if (itemIndex > -1) {
      newTotalQuantity += cart.items[itemIndex].quantity;
    }

    // Check if total quantity exceeds available stock
    if (product.stock < newTotalQuantity) {
      return res.status(400).json({
        message: `Cannot add ${quantity} more items. Available stock: ${product.stock}, Already in cart: ${itemIndex > -1 ? cart.items[itemIndex].quantity : 0}`,
      });
    }

    if (itemIndex > -1) {
      // Update quantity if product exists
      cart.items[itemIndex].quantity = newTotalQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name imageUrl",
    });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update cart item quantity
router.put("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock availability directly against the requested quantity
    // since we're replacing the old quantity, not adding to it
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Requested quantity exceeds available stock. Maximum available: ${product.stock}`,
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name imageUrl",
    });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item from cart
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name imageUrl",
    });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear cart
router.delete("/clear", auth, async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear items
    cart.items = [];
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
