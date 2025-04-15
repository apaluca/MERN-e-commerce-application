const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: "https://dummyimage.com/200x200/e0e0e0/333333&text=Product",
  },
  images: {
    type: [String],
    default: [],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate the images array doesn't exceed maximum length
function arrayLimit(val) {
  return val.length <= 5; // Maximum of 5 additional images
}

// Update the updatedAt field on save
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // If imageUrl is not set but images has items, use the first image as imageUrl
  if (!this.imageUrl && this.images.length > 0) {
    this.imageUrl = this.images[0];
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
