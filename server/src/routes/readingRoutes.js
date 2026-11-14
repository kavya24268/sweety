const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
} = require("../controllers/readingController");

const router = express.Router();

router.post("/", authenticateToken, createReading);
router.get("/", authenticateToken, getReadings);
router.get("/:id", authenticateToken, getReadingById);
router.put("/:id", authenticateToken, updateReading);

module.exports = router;