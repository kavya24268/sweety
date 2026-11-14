const pool = require("../config/db");

const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        reading_date,
        slot,
        glucose_value
       FROM readings
       WHERE user_id = $1
       AND reading_date = $2
       ORDER BY
         CASE slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [userId, date]
    );

    const readings = result.rows;

    if (readings.length === 0) {
      return res.status(200).json({
        success: true,
        report: {
          date,
          highest: null,
          lowest: null,
          average: null,
          count: 0,
          readings: [],
        },
      });
    }

    const glucoseValues = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest = Math.max(...glucoseValues);
    const lowest = Math.min(...glucoseValues);

    const average =
      glucoseValues.reduce((sum, value) => sum + value, 0) /
      glucoseValues.length;

    return res.status(200).json({
      success: true,
      report: {
        date,
        highest,
        lowest,
        average: Number(average.toFixed(1)),
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMonthToDateReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    const firstDayOfMonth = `${date.substring(0, 7)}-01`;

    const result = await pool.query(
      `SELECT
        id,
        reading_date,
        slot,
        glucose_value
       FROM readings
       WHERE user_id = $1
       AND reading_date BETWEEN $2 AND $3
       ORDER BY reading_date ASC,
         CASE slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [userId, firstDayOfMonth, date]
    );

    const readings = result.rows;

    if (readings.length === 0) {
      return res.status(200).json({
        success: true,
        report: {
          startDate: firstDayOfMonth,
          endDate: date,
          highest: null,
          lowest: null,
          average: null,
          count: 0,
          readings: [],
        },
      });
    }

    const glucoseValues = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest = Math.max(...glucoseValues);
    const lowest = Math.min(...glucoseValues);

    const average =
      glucoseValues.reduce((sum, value) => sum + value, 0) /
      glucoseValues.length;

    return res.status(200).json({
      success: true,
      report: {
        startDate: firstDayOfMonth,
        endDate: date,
        highest,
        lowest,
        average: Number(average.toFixed(1)),
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    const monthPattern = /^\d{4}-\d{2}$/;

    if (!monthPattern.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format",
      });
    }

    const firstDayOfMonth = `${month}-01`;

    const result = await pool.query(
      `SELECT
        id,
        reading_date,
        slot,
        glucose_value
       FROM readings
       WHERE user_id = $1
       AND reading_date >= $2::date
       AND reading_date < ($2::date + INTERVAL '1 month')
       ORDER BY reading_date ASC,
         CASE slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [userId, firstDayOfMonth]
    );

    const readings = result.rows;

    if (readings.length === 0) {
      return res.status(200).json({
        success: true,
        report: {
          month,
          highest: null,
          lowest: null,
          average: null,
          count: 0,
          readings: [],
        },
      });
    }

    const glucoseValues = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest = Math.max(...glucoseValues);
    const lowest = Math.min(...glucoseValues);

    const average =
      glucoseValues.reduce((sum, value) => sum + value, 0) /
      glucoseValues.length;

    return res.status(200).json({
      success: true,
      report: {
        month,
        highest,
        lowest,
        average: Number(average.toFixed(1)),
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};