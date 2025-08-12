const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const vocabularyRoutes = require("./routes/vocabulary");

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/vocabulary", vocabularyRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Vocabulary Learning API is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/`);
  console.log(`⏰ Started at: ${new Date().toLocaleString("vi-VN")}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
