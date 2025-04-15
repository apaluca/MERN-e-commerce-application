const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, authorize } = require("../middleware/auth");

// Get all products with pagination and filtering - PUBLIC ROUTE
router.get("/", async (req, res) => {
  try {
    // Build filter object based on query parameters
    const filter = {};
    const sort = {};

    // Apply category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Apply featured filter
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    // Apply search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Apply price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Apply sorting
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-asc":
          sort.price = 1;
          break;
        case "price-desc":
          sort.price = -1;
          break;
        case "name-asc":
          sort.name = 1;
          break;
        case "name-desc":
          sort.name = -1;
          break;
        case "newest":
          sort.createdAt = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      // Default sort by date
      sort.createdAt = -1;
    }

    // Pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 means no limit
    const skip = (page - 1) * limit;

    // Execute query with pagination
    let query = Product.find(filter).sort(sort);

    // Apply pagination if limit is provided
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Execute query
    const products = await query;

    // Send response with pagination info
    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product - PUBLIC ROUTE
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    // Validate images array (max 5 additional images)
    if (req.body.images && req.body.images.length > 5) {
      return res
        .status(400)
        .json({ message: "Maximum of 5 additional images allowed" });
    }

    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product (admin only)
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    // Validate images array (max 5 additional images)
    if (req.body.images && req.body.images.length > 5) {
      return res
        .status(400)
        .json({ message: "Maximum of 5 additional images allowed" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search products
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
