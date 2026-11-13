const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { createReading } = require("../controllers/readingController");

const router = express.Router();

router.post("/", authenticateToken, createReading);

module.exports = router;