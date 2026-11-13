const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createReading,
  getReadings,
} = require("../controllers/readingController");
const router = express.Router();

router.post("/", authenticateToken, createReading);
router.get("/", authenticateToken, getReadings);

module.exports = router;