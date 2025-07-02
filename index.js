require("dotenv").config();
const express = require("express");

const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const authRoute = require("./src/routes/auth.route")
app.use("/api/v1/auth", authRoute)
const port = 4000;
const mongodbUrl = process.env.MONGO_DB_URL;

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(mongodbUrl);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
connectDB();
