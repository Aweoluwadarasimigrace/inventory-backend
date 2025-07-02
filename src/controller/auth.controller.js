const Auth = require("../model/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};

const registerUser = async (req, res) => {
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
    });

    const token = getToken(newUser._id);

    res.status(200).json({
      success: true,
      message: "successful",
      data: newUser,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.json({
        message: "user not found/ login failed",
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
};
