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
  console.log(req.body);
  const { email, firstname, lastname, password } = req.body;

  if (!email || !password || !firstname || !lastname) {
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
      firstname,
      lastname,
      email,
      password: hashedPassword,
      verified: false,
    });

    const id = newUser._id;
    const verifyEmailToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });
    console.log(verifyEmailToken)
    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${verifyEmailToken}`;

    const html = `
    <h1>Verify your Email</h1>
    <p>click the link to verify your email</p>
    <a href="${verifyLink}">link</a>
    `;

    await sendEmail(email, "verify your account ", html);

    const token = getToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message:
        "successfully created user, please verify your email  to proceed",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
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
    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verification error:", error.message);
    return res
      .status(400)
      .json({ message: "Invalid or expired token", error: error.message });
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
      return res.status(400).json({ message: "user is already verified" });
    }

    const id = userExist._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });
    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${token}`;

    const html = `<h1>Verify your Email</h1>
    <p>click the link to verify your email</p>
    <a href="${verifyLink}">link</a>`;

    await sendEmail(email, "verify your account", html);
    res.status(200).json({ message: "Verification email resent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.json({
        message: "user not found/ login failed",
      });
    }

    if (!user.verified) {
      return res.json({
        message: "email has not been verfied",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.json({
        message: "something went wrong",
      });
    }

    const id = user._id;
    const token = getToken(id);
    res.json({
      message: "login successful",
      token,
    });
  } catch (error) {
    res.json({
      error: error,
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  verifyEmail,
  resendEmail
};
