require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.BASE_URL,
  credentials:true
}));
app.use(cookieParser())
// Routes
const authRoute = require("./src/routes/auth.route");
app.use("/api/v1/auth", authRoute);

// Health check route (for Render to confirm it works)
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Render");
});

// Use Render's provided PORT or fallback for local
const port = process.env.PORT || 4000;
const mongodbUrl = process.env.MONGO_DB_URL;

// Connect to MongoDB and Start Server
mongoose
  .connect(mongodbUrl)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });
