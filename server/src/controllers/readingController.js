const pool = require("../config/db");

const ALLOWED_SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner",
];

const createReading = async (req, res) => {
  try {
    const { readingDate, slot, glucoseValue } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!readingDate || !slot || glucoseValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Reading date, slot and glucose value are required",
      });
    }

    // Validate slot
    if (!ALLOWED_SLOTS.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reading slot",
      });
    }

    // Validate whole number
    if (
      typeof glucoseValue !== "number" ||
      !Number.isInteger(glucoseValue)
    ) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be a whole number",
      });
    }

    // Validate glucose range
    if (glucoseValue < 40 || glucoseValue > 600) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be between 40 and 600 mg/dL",
      });
    }

    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(readingDate)) {
      return res.status(400).json({
        success: false,
        message: "Reading date must be in YYYY-MM-DD format",
      });
    }

    // Prevent future dates
    const today = new Date().toISOString().split("T")[0];

    if (readingDate > today) {
      return res.status(400).json({
        success: false,
        message: "Future dates are not allowed",
      });
    }

    // Check maximum of 4 readings per day
    const dailyCountResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM readings
       WHERE user_id = $1
       AND reading_date = $2`,
      [userId, readingDate]
    );

    const dailyCount = Number(dailyCountResult.rows[0].count);

    if (dailyCount >= 4) {
      return res.status(409).json({
        success: false,
        message: "Maximum of 4 readings allowed per day",
      });
    }

    // Check duplicate slot for the same date
    const duplicateResult = await pool.query(
      `SELECT id
       FROM readings
       WHERE user_id = $1
       AND reading_date = $2
       AND slot = $3`,
      [userId, readingDate, slot]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this date and slot",
      });
    }

    // Insert reading
    const result = await pool.query(
      `INSERT INTO readings (
        user_id,
        reading_date,
        slot,
        glucose_value
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, reading_date, slot, glucose_value, created_at`,
      [userId, readingDate, slot, glucoseValue]
    );

    return res.status(201).json({
      success: true,
      message: "Glucose reading added successfully",
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Create reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getReadings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        id,
        reading_date,
        slot,
        glucose_value,
        created_at,
        updated_at
       FROM readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      readings: result.rows,
    });
  } catch (error) {
    console.error("Get readings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getReadingById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;

    const result = await pool.query(
      `SELECT
        id,
        reading_date,
        slot,
        glucose_value,
        created_at,
        updated_at
       FROM readings
       WHERE id = $1
       AND user_id = $2`,
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Get reading by ID error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateReading = async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;
    const { readingDate, slot, glucoseValue } = req.body;

    // Validate required fields
    if (!readingDate || !slot || glucoseValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Reading date, slot and glucose value are required",
      });
    }

    // Validate slot
    if (!ALLOWED_SLOTS.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reading slot",
      });
    }

    // Validate whole number
    if (
      typeof glucoseValue !== "number" ||
      !Number.isInteger(glucoseValue)
    ) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be a whole number",
      });
    }

    // Validate glucose range
    if (glucoseValue < 40 || glucoseValue > 600) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be between 40 and 600 mg/dL",
      });
    }

    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(readingDate)) {
      return res.status(400).json({
        success: false,
        message: "Reading date must be in YYYY-MM-DD format",
      });
    }

    // Prevent future dates
    const today = new Date().toISOString().split("T")[0];

    if (readingDate > today) {
      return res.status(400).json({
        success: false,
        message: "Future dates are not allowed",
      });
    }

    // Check that the reading belongs to the logged-in user
    const existingReading = await pool.query(
      `SELECT id
       FROM readings
       WHERE id = $1
       AND user_id = $2`,
      [readingId, userId]
    );

    if (existingReading.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    // Check duplicate date + slot, excluding the current reading
    const duplicateResult = await pool.query(
      `SELECT id
       FROM readings
       WHERE user_id = $1
       AND reading_date = $2
       AND slot = $3
       AND id != $4`,
      [userId, readingDate, slot, readingId]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this date and slot",
      });
    }

    // Update reading
    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           slot = $2,
           glucose_value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       AND user_id = $5
       RETURNING id, reading_date, slot, glucose_value, created_at, updated_at`,
      [readingDate, slot, glucoseValue, readingId, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Glucose reading updated successfully",
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Update reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
};