const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/daily", authenticateToken, getDailyReport);
router.get("/month-to-date", authenticateToken, getMonthToDateReport);
router.get("/monthly", authenticateToken, getMonthlyReport);

module.exports = router;