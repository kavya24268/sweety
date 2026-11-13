const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety API running on port ${PORT}`);
});