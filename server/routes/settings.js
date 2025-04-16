const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { auth, authorize } = require("../middleware/auth");

// Get setting by key
router.get("/:key", async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.json(setting.value);
  } catch (err) {
    console.error("Error fetching setting:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update or create setting (admin only)
router.put("/:key", auth, authorize("admin"), async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;

    console.log("Updating setting:", key, "with value:", value);

    // Custom handling for specific keys
    if (key === "carousel") {
      if (typeof value !== "object" || value === null) {
        return res
          .status(400)
          .json({ message: "Invalid value for carousel setting" });
      }

      const processedValue = {
        autoPlay: typeof value.autoPlay === "boolean" ? value.autoPlay : true,
        interval: parseInt(value.interval) || 4000,
      };

      const setting = await Settings.findOneAndUpdate(
        { key },
        { value: processedValue },
        { upsert: true, new: true },
      );

      return res.json({ key: setting.key, value: setting.value });
    }

    // Generic fallback for other settings
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true },
    );

    res.json({ key: setting.key, value: setting.value });
  } catch (err) {
    console.error("Error updating setting:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
