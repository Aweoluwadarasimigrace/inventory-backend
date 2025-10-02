const Auth = require("../model/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// generate token
const getToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

// register user

const registerUser = async (req, res) => {
  const {
    companyName,
    email,
    contact,
    countrycode,
    number,
    password,
    country,
  } = req.body;
console.log(req.body)
  if (
    !email ||
    !password ||
    !contact ||
    !companyName ||
    !country ||
    !countrycode ||
    !number
  ) {
    return res.status(400).json({
      status: "FAILED",
      message: "Fill out all fields",
    });
  }

  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "FAILED",
        message: "User Already Registered",
      });
    }

    const salt = await bcrypt.genSalt(13);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Auth.create({
      companyName,
      email,
      contact,
      number,
      countrycode,
      password: hashedPassword,
      country,
    });

    const token = getToken(newUser._id);

    // ✅ Skip email verification for now
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};


// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "user not found/ login failed",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "incorrect password",
      });
    }

    const id = user._id;
    const token = getToken(id);
    res.status(201).json({
      message: "login successful",
      token: token,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

const verifySession = async (req, res) => {
  res.status(200).json({
    message: "session is valid",
    user: req.user,
  });
};

const logOut = async (req, res) => {
  try {
    return res.json({ message: "logout successful" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};
module.exports = {
  loginUser,
  registerUser,
  logOut,
  verifySession,
};
