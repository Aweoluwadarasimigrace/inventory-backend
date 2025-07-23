const jwt = require("jsonwebtoken");
const Auth = require("../model/auth.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

const getAllUser = async(req,res)=>{
  try {
   const user = req.user
   res.status(200).json({user: user, message: "success"})
  } catch (error) {
       return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
}
const getUserByAdmin = async (req, res) => {
  try {
    const salesUsers = await Auth.find({
      createdBy: req.user._id,
      role:"sales",
      verified: true,
    });
    console.log(req.user._id)

    // Even if no users found, salesUsers will be an empty array, not null
    if (salesUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ salesUsers });
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
    !password 

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
      password: hashedPassword,
      verified: false,
      createdBy: req.user._id
    };

    if (req.file) {
      userData.profilepicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const createdUser = await Auth.create(userData);

    const id = createdUser._id;
    console.log(id)

    const verifyEmailToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    const baseUrl = process.env.FRONTEND_URL;
    const verifyLink = `${baseUrl}/auth/verify-email/?token=${verifyEmailToken}`;
    console.log(verifyEmailToken)

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




module.exports = {
  createUserByAdmin,
  getUserByAdmin,
  getAllUser
};
