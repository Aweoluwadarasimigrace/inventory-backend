const Auth = require("../model/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

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

  if (
    !email ||
    !password ||
    !contact ||
    !companyName ||
    !country ||
    !countrycode ||
    !number
  ) {
    return res.status(404).json({
      status: "FAILED",
      message: "Fill out all fields",
    });
  }

  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.json({
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
      verified: false,
    });

    const id = newUser._id;
    const verifyEmailToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });
    console.log(verifyEmailToken);
    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${verifyEmailToken}`;

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to TRACKSTACK INVENTORY 🎉</h2>
    <p style="font-size: 16px; color: #555;">
      Hello ${companyName},
    </p>
    <p style="font-size: 16px; color: #555;">
      Thank you for registering! To complete your signup and activate your account, please verify your email address by clicking the button below.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
    </div>
    <p style="font-size: 14px; color: #999;">
      If you did not sign up for this account, you can ignore this email.
    </p>
    <p style="font-size: 14px; color: #999;">
      — The TRACKSTACK INVENTORY Team
    </p>
  </div>
`;

    await sendEmail(email, "verify your account ", html);

    const token = getToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message:
        "successfully created user, please verify your email  to proceed",
      data: newUser,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

// verify email
const verifyEmail = async (req, res) => {
  const verifyToken = req.query.token;
  if (!verifyToken) {
    return res.json({ message: "user nor present" });
  }

  try {
    const decoded = jwt.verify(verifyToken, process.env.JWT_SECRET_KEY);

    const userId = decoded.id;

    const user = await Auth.findById(userId);
   

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.verified) {
      return res.status(200).json({ message: "email already verified" });
    }

    user.verified = true;

    await user.save();
    return res.status(201).json({ message: "Email verified successfully!" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

// resend  email link
const resendEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  try {
    const userExist = await Auth.findOne({ email });

    if (!userExist) {
      return res.status(404).json({ message: "user doesn't exists" });
    }

    if (userExist.verified) {
      return res.status(409).json({ message: "user is already verified" });
    }

    const id = userExist._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });
    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${token}`;

   const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Resend: Verify Your Email Address 🔄</h2>
    <p style="font-size: 16px; color: #555;">
      Hi again,
    </p>
    <p style="font-size: 16px; color: #555;">
      It looks like you haven't verified your email address yet. Please click the button below to complete your registration and activate your account.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyLink}" style="background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email Now
      </a>
    </div>
    <p style="font-size: 14px; color: #999;">
      If you've already verified your email, you can ignore this message.
    </p>
    <p style="font-size: 14px; color: #999;">
      — The TRACKSTACK INVENTORY Team
    </p>
  </div>
`;


    await sendEmail(email, "verify your account", html);
    res.status(201).json({ message: "Verification email resent!" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
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

    if (!user.verified) {
      return res.status(404).json({
        message: "email has not been verfied",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({
        message: "something went wrong",
      });
    }

    const id = user._id;
    const token = getToken(id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "login successful",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

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
  verifyEmail,
  resendEmail,
  logOut,
};
