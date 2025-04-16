const express = require("express");
const router = express.Router();
const { upload, cloudinary } = require("../utils/cloudinaryConfig");
const { auth, authorize } = require("../middleware/auth");

// Single image upload route
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    // The uploaded file is available in req.file thanks to multer
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the Cloudinary URL and public ID
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Multiple images upload route (max 5)
router.post("/images", auth, upload.array("images", 5), async (req, res) => {
  try {
    // req.files is an array of files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Return array of Cloudinary URLs and public IDs
    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.json(uploadedFiles);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
});

// Delete image route
router.delete(
  "/image/:public_id",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      const public_id = req.params.public_id;
      if (!public_id) {
        return res.status(400).json({ message: "No public_id provided" });
      }

      // Delete the image from Cloudinary
      const result = await cloudinary.uploader.destroy(public_id);

      if (result.result === "ok") {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete image" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Error deleting image" });
    }
  },
);

module.exports = router;
