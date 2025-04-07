const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { auth, authorize } = require("../middleware/auth");

// Get user orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "name imageUrl",
      });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin only)
router.get("/all", auth, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "username email",
      })
      .populate({
        path: "items.product",
        select: "name imageUrl",
      });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "items.product",
      select: "name imageUrl",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission (own order or admin)
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Check stock availability and prepare order items
    const orderItems = [];
    let stockAvailable = true;
    let outOfStockItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        stockAvailable = false;
        outOfStockItems.push(product.name);
      } else {
        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    if (!stockAvailable) {
      return res.status(400).json({
        message: "Some items are out of stock",
        items: outOfStockItems,
      });
    }

    // Create new order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total: cart.total,
      shippingAddress,
      paymentMethod,
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate the product details before sending the response
    await createdOrder.populate({
      path: "items.product",
      select: "name imageUrl",
    });

    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin only)
router.put("/:id/status", auth, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Populate the product details
    await updatedOrder.populate({
      path: "items.product",
      select: "name imageUrl",
    });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
