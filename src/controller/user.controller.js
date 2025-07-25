const jwt = require("jsonwebtoken");
const Auth = require("../model/auth.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

const getAllUser = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    res.status(200).json({ user: user, message: "success" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
};
const getUserByAdmin = async (req, res) => {
  try {
    const salesusers = await Auth.find({
      createdBy: req.user._id,
      role: {$in: ["sales representative", "product manager"]},
    });
    console.log(req.user._id);

    // Even if no users found, salesUsers will be an empty array, not null
    if (salesusers.length === 0) {
      return res.status(200).json({ salesusers:[] });
    }

    res.status(200).json({ salesusers });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
};

const createUserByAdmin = async (req, res) => {
  const {
    username,
    firstname,
    lastname,
    role,
    email,
    contact,
    number,
    countrycode,
    password,
    profilepicture,
    gender
  } = req.body;
  if (
    !username ||
    !firstname ||
    !lastname ||
    !role ||
    !email ||
    !contact ||
    !number ||
    !countrycode ||
    !password||
    !profilepicture ||
    !gender
  ) {
    return res.status(404).json({ message: "please fill out all fields" });
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

    const userData = {
      username,
      firstname,
      lastname,
      role,
      email,
      contact,
      number,
      countrycode,
      profilepicture, 
      gender,
      password: hashedPassword,
      verified: false,
      createdBy: req.user._id,
    };
    const createdUser = await Auth.create(userData);
    const id = createdUser._id;
    console.log(id);

    const verifyEmailToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${verifyEmailToken}`;
    console.log(verifyEmailToken);

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to TRACKSTACK INVENTORY 🎉</h2>
    <p style="font-size: 16px; color: #555;">
      Hello ${firstname},
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
  </div>`;

    await sendEmail(email, "verify your account ", html);

    res.status(201).json({ message: "user created successfully", createdUser });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

const updateUser = async (req, res) => {
  const userId = req.user._id;

  const { username, profilepicture } = req.body;
  console.log(profilepicture)
  const updatedFields = {};

  if (username) {
    updatedFields.username = username;
  }
  if (profilepicture) {
    updatedFields.profilepicture = profilepicture;
  }

  try {
    const updatedUser = await Auth.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};


const searchForUser = async(req, res)=>{
   const {query}=req.query // gets whatever was typed in search box (e.g. "ade")
   try {
    const regex = new RegExp(query, "i")
   const user = await Auth.find({
    $or:[
      {firstname: regex},
      {lastname: regex},
      {username: regex},
      {email: regex}
    ]
   })

   res.status(200).json({user})
   } catch (error) {
     res.status(500).json({ message: "Server error", error });
   }
}
module.exports = {
  createUserByAdmin,
  getUserByAdmin,
  getAllUser,
  updateUser,
  searchForUser
};
