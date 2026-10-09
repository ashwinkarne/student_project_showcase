
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const Project = require("./models/Project");
const authMiddleware = require("./middleware/authMiddleware");

const User = require("./models/User");

const app = express();
const dns = require("dns");
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Student Project Showcase API is running");
});

// Signup API
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, rollNumber, email, password } = req.body;

    // Check required fields
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in MongoDB
    const user = await User.create({
      name,
      rollNumber,
      email: normalizedEmail,
      password: hashedPassword
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response without password
    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email
      }
    });
  } catch (error) {
    // Handle a duplicate email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      message: "Server error during signup"
    });
  }
});


app.post("/api/projects", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl,
      coverImage
    } = req.body;

    if (!title || !description || !githubUrl) {
      return res.status(400).json({
        message: "Title, description and GitHub URL are required"
      });
    }

    const project = await Project.create({
      title,
      description,
      technologies: technologies || [],
      githubUrl,
      liveDemoUrl: liveDemoUrl || "",
      coverImage: coverImage || "",
      user: req.userId
    });

    res.status(201).json({
      message: "Project published successfully",
      project
    });
  } catch (error) {
    console.error("Project creation error:", error.message);
    res.status(500).json({
      message: "Failed to publish project"
    });
  }
});

app.get("/api/projects/my", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your projects"
    });
  }
});

app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner"
      });
    }

    res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid project ID or request"
    });
  }
});
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});