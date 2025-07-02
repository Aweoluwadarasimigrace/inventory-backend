require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoute = require("./src/routes/auth.route");
app.use("/api/v1/auth", authRoute);

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Render");
});   
   
// Use Render's provided PORT or fallback to 4000 (for local dev)
const port = process.env.PORT;
const mongodbUrl = process.env.MONGO_DB_URL;

// Database Connection and Server Start
const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUrl);
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
  }
};

connectDB();

