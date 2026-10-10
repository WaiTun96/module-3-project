import jwt from "jsonwebtoken";
import { User } from "../schemas/schemas.js";

// JWT Token ထုတ်ပေးသည့် Helper Function
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token သက်တမ်း ၇ ရက်
  });
};

// 1. ADMIN REGISTER (Initial Admin ဆောက်ရန်)
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // အချက်အလက် စုံ/မစုံ စစ်ဆေးခြင်း
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Username သို့မဟုတ် Email ရှိပြီးသားလား စစ်ဆေးခြင်း
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Admin အသစ်ဖန်တီးခြင်း (Password ကို Schema ထဲရှိ pre-save hook က automatically hash လုပ်ပေးပါမည်)
    const user = await User.create({ username, email, password });

    res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    // Terminal တွင် Error အတိအကျ ပေါ်စေရန်
    console.error("Register Error Details:", error);
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// 2. ADMIN LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Email ဖြင့် Admin ကို ရှာခြင်း
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Password မှန်မမှန် စစ်ဆေးခြင်း (Schema ထဲရှိ comparePassword method သုံးထားသည်)
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // အောင်မြင်ပါက Token ပြန်ပေးခြင်း
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. GET CURRENT LOGGED IN ADMIN DETAILS
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};