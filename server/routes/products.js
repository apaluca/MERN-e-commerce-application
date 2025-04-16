const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
const { auth, authorize } = require("../middleware/auth");
const { cloudinary } = require("../utils/cloudinaryConfig");

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

    // Handle main image changes
    if (req.body.imageUrl !== product.imageUrl && product.imagePublicId) {
      // Only delete if this is a Cloudinary image (has a public ID)
      // and it's actually being changed
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    // Handle additional images - find and delete removed images
    if (req.body.imagesPublicIds && product.imagesPublicIds) {
      const removedPublicIds = product.imagesPublicIds.filter(
        (publicId) => !req.body.imagesPublicIds.includes(publicId),
      );

      // Delete removed images from Cloudinary
      if (removedPublicIds.length > 0) {
        try {
          await Promise.all(
            removedPublicIds.map((publicId) =>
              cloudinary.uploader.destroy(publicId),
            ),
          );
        } catch (cloudinaryError) {
          console.error(
            "Error deleting images from Cloudinary:",
            cloudinaryError,
          );
        }
      }
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

// Delete product (admin only) with cascading delete
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productId = product._id;

    // Delete images from Cloudinary if they have public IDs
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue execution even if deletion fails
      }
    }

    if (product.imagesPublicIds && product.imagesPublicIds.length > 0) {
      try {
        await Promise.all(
          product.imagesPublicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId),
          ),
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError,
        );
        // Continue execution even if deletion fails
      }
    }

    // Cascading delete: remove all data related to this product
    await Promise.all([
      // Delete all reviews for this product
      Review.deleteMany({ product: productId }),

      // Remove product from all user carts
      Cart.updateMany(
        { "items.product": productId },
        { $pull: { items: { product: productId } } },
      ),

      // Recalculate cart totals after removing the product
      Cart.find({ "items.product": productId }).then((carts) => {
        return Promise.all(carts.map((cart) => cart.save()));
      }),

      // Delete the product itself
      Product.findByIdAndDelete(productId),
    ]);

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
