require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5176",
      "https://inventory-frontend-woad-ten.vercel.app",
    ],

  })
);




// Routes
const authRoute = require("./src/routes/auth.route");
const userRoute = require("./src/routes/user.route");
const pdfRoute = require("./src/routes/pdfdownload.route");
const customerRoute = require("./src/routes/customer.route")
const productRoute = require("./src/routes/product.route");
const salesRoute = require("./src/routes/sales.route");
const reportRoute = require("./src/routes/reports.route");
const purchaseRoute = require("./src/routes/purchase.route");
const salesReturnRoute = require("./src/routes/return.route");
const dashboardRoute = require("./src/routes/dashboard.route");
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/pdf", pdfRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/sales", salesRoute);
app.use("/api/v1/reports", reportRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/returns", salesReturnRoute);
app.use("/api/v1/dashboard", dashboardRoute);
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
