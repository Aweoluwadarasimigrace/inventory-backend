require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");

// Middleware
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5176",
      "https://inventory-frontend-woad-ten.vercel.app",
    ],
    credentials: true,
  })
);

// creating http server and socket.io server
const server = http.createServer(app);

const { server } = require("socket.io");
const io = new server(server, {
  cors: {
    origin: [
      "http://localhost:5174",
      "http://localhost:5176",
      "https://inventory-frontend-woad-ten.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});


newSocket(io)
app.use(cookieParser());
// Routes
const authRoute = require("./src/routes/auth.route");
const userRoute = require("./src/routes/user.route");
const pdfRoute = require("./src/routes/pdfdownload.route");
const { newSocket } = require("./src/socket/socket");
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api", pdfRoute);
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
