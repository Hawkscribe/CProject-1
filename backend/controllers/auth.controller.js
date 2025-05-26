import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "mummaislife";

// Generate JWT and set as cookie
const generateT = (user_id, res) => {
  const token = jwt.sign({ user_id }, JWT_SECRET, {
    expiresIn: '15d'
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });
};

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      username,
      email,
      password: hashpass
    });

    await newUser.save();
    generateT(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });

  } catch (error) {
    res.status(400).json({
      error: "Error in the signup window page: " + error.message
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateT(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });

  } catch (error) {
    res.status(400).json({
      error: "Error in the login window page: " + error.message
    });
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully!!!" });
  } catch (error) {
    res.status(500).json({ msg: 'There is an error in the logout' });
  }
};

// Get Current User
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe function:", error);
    res.status(500).json({ msg: "Error retrieving user data" });
  }
};
