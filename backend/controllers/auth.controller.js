import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET="mummaislife"
const generateT = (user_id, res) => {
  const token = jwt.sign({user_id}, JWT_SECRET, {
    expiresIn: '15d'
  });
  res.cookie("jwt", token, {
    maxAge: 15*24*60*60*1000,
    //  httpOnly: true,
    //  sameSite: "strict"
  });
};

export const signup = async (req, res) => {
  try {
    const {fullname, username, email, password} = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({error: "Invalid email format"});   
    }
    //this is
    const existinguser = await User.findOne({username});
    if (existinguser) {
      return res.status(400).json({error: "Username is already taken"});
    }
    
    const existMail = await User.findOne({eMail: email}); // Changed to findOne and match schema field name
    if (existMail) {
      return res.status(400).json({error: "Email is already taken"});
    }
    
    if (password.length < 6) { // Changed to check string length
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      fullName: fullname, // Match schema field name
      username,
      eMail: email, // Match schema field name
      password: hashpass
    });
    
    if (newUser) {
      generateT(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullName, // Match schema field name
        username: newUser.username,
        email: newUser.eMail, // Match schema field name
        followers: newUser.followers,
        // following field is not in your schema
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({
        error: "Invalid user data"
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Error in the signup window page: " + error.message
    });
  }
}

export const login = async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); // Removed extra parentheses
    
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({error: "Invalid credentials"});
    }
    
    generateT(user._id, res); // Changed user_id to user._id
    
    // Add a response with user data
    res.status(200).json({
      _id: user._id,
      fullname: user.fullName,
      username: user.username,
      email: user.eMail,
      followers: user.followers,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
    
  } catch (error) {
    res.status(400).json({
      error: "Error in the login window page: " + error.message
    });
  }
}

export const logout = async (req, res) => {
  // Clear the JWT cookie
  try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out sucessfully!!!"});
  } catch (error) {
    res.status(500).json({msg:'There is an error in the logout'});
  }
}


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
