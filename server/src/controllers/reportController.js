const pool = require("../config/db");

// =========================
// DAILY REPORT
// =========================

const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const result = await pool.query(
      `SELECT
          id,
          reading_date::text AS reading_date,
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
      [req.user.userId, date]
    );

    const readings = result.rows;

    const values = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest =
      values.length > 0 ? Math.max(...values) : null;

    const lowest =
      values.length > 0 ? Math.min(...values) : null;

    const average =
      values.length > 0
        ? Number(
            (
              values.reduce((sum, value) => sum + value, 0) /
              values.length
            ).toFixed(1)
          )
        : null;

    return res.status(200).json({
      success: true,
      report: {
        date,
        highest,
        lowest,
        average,
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily report",
    });
  }
};


// =========================
// MONTH-TO-DATE REPORT
// =========================

const getMonthToDateReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const startDate = `${date.substring(0, 7)}-01`;

    const result = await pool.query(
      `SELECT
          id,
          reading_date::text AS reading_date,
          slot,
          glucose_value
       FROM readings
       WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3
       ORDER BY
         reading_date ASC,
         CASE slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [req.user.userId, startDate, date]
    );

    const readings = result.rows;

    const values = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest =
      values.length > 0 ? Math.max(...values) : null;

    const lowest =
      values.length > 0 ? Math.min(...values) : null;

    const average =
      values.length > 0
        ? Number(
            (
              values.reduce((sum, value) => sum + value, 0) /
              values.length
            ).toFixed(1)
          )
        : null;

    return res.status(200).json({
      success: true,
      report: {
        startDate,
        endDate: date,
        highest,
        lowest,
        average,
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error(
      "Month-to-date report error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate month-to-date report",
    });
  }
};


// =========================
// MONTHLY REPORT
// PREVIOUS CALENDAR MONTH
// =========================

const getMonthlyReport = async (req, res) => {
  try {
    const today = new Date();

    // Get the previous calendar month
    const previousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const year = previousMonth.getFullYear();
    const monthNumber = previousMonth.getMonth() + 1;

    // First day of previous month
    const startDate = `${year}-${String(monthNumber).padStart(
      2,
      "0"
    )}-01`;

    // Last day of previous month
    const lastDay = new Date(
      year,
      monthNumber,
      0
    ).getDate();

    const endDate = `${year}-${String(monthNumber).padStart(
      2,
      "0"
    )}-${String(lastDay).padStart(2, "0")}`;

    const result = await pool.query(
      `SELECT
          id,
          reading_date::text AS reading_date,
          slot,
          glucose_value
       FROM readings
       WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3
       ORDER BY
         reading_date ASC,
         CASE slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [
        req.user.userId,
        startDate,
        endDate,
      ]
    );

    const readings = result.rows;

    const values = readings.map(
      (reading) => Number(reading.glucose_value)
    );

    const highest =
      values.length > 0
        ? Math.max(...values)
        : null;

    const lowest =
      values.length > 0
        ? Math.min(...values)
        : null;

    const average =
      values.length > 0
        ? Number(
            (
              values.reduce(
                (sum, value) => sum + value,
                0
              ) / values.length
            ).toFixed(1)
          )
        : null;

    const monthLabel =
      previousMonth.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );

    return res.status(200).json({
      success: true,
      report: {
        month: monthLabel,
        startDate,
        endDate,
        highest,
        lowest,
        average,
        count: readings.length,
        readings,
      },
    });
  } catch (error) {
    console.error(
      "Monthly report error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
    });
  }
};


// =========================
// EXPORTS
// =========================

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};