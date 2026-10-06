
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "defaultsecret",
    {
      expiresIn: "30d",
    }
  );
};

// ===============================
// REGISTER
// POST /api/user/register
// ===============================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Create user
    // New registered users are customers by default
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: "customer",
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid user data",
      });
    }

    // Registration successful
    return res.status(201).json({
      success: true,
      message: "Registration successful",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ===============================
// LOGIN
// POST /api/user/login
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // User does not exist
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await user.matchPassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Login successful
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};
