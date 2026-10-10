
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const Project = require("./models/Project");
const authMiddleware = require("./middleware/authMiddleware");

const User = require("./models/User");
const Comment = require("./models/Comment");
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

app.post("/api/addproject", async (req, res) => {
  try {
    const {
      userId,
      name,
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl
    } = req.body;

    if (!userId || !title || !description || !githubUrl) {
      return res.status(400).json({
        message: "User ID, title, description and GitHub URL are required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      technologies: Array.isArray(technologies) ? technologies : [],
      githubUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl || "",
      coverImage: "",
      user: user._id
    });

    res.status(201).json({
      message: "Project published successfully",
      project
    });
  } catch (error) {
    console.error("Project creation error:", error);

    res.status(500).json({
      message: error.message || "Failed to publish project"
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


// GET /api/projects — fetch all projects for the feed
app.get("/api/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user", "name rollNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Fetch projects error:", error.message);

    res.status(500).json({
      message: "Failed to fetch projects"
    });
  }
});



app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));





app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
});

// GET comments for a specific project
app.get(
  "/api/projects/:projectId/comments",
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const comments = await Comment.find({
        project: projectId,
      })
        .populate("user", "name")
        .sort({ createdAt: -1 });

      res.json(comments);
    } catch (error) {
      console.error("Fetch comments error:", error);
      res.status(500).json({
        message: "Failed to fetch comments",
      });
    }
  }
);

// // POST a comment on a specific project
// app.post(
//   "/api/projects/:projectId/comments",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { projectId } = req.params;
//       const { text } = req.body;

//       if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         return res.status(400).json({
//           message: "Invalid project ID",
//         });
//       }

//       if (!text || !text.trim()) {
//         return res.status(400).json({
//           message: "Comment cannot be empty",
//         });
//       }

//       if (text.trim().length > 1000) {
//         return res.status(400).json({
//           message: "Comment must be 1000 characters or fewer",
//         });
//       }

//       const project = await Project.findById(projectId);

//       if (!project) {
//         return res.status(404).json({
//           message: "Project not found",
//         });
//       }

//       const comment = await Comment.create({
//         project: projectId,
//         user: req.user.id,
//         text: text.trim(),
//       });

//       await comment.populate("user", "name");

//       res.status(201).json({
//         message: "Comment added successfully",
//         comment,
//       });
//     } catch (error) {
//       console.error("Add comment error:", error);
//       res.status(500).json({
//         message: "Failed to add comment",
//       });
//     }
//   }
// );

// POST a comment on a specific project
app.post(
  "/api/projects/:projectId/comments",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { text } = req.body;

      // Support the user ID format set by your auth middleware
      const userId = req.user?.userId || req.user?.id || req.user?._id || req.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({
          message: "Valid authenticated user ID not found",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      if (!text || !text.trim()) {
        return res.status(400).json({
          message: "Comment cannot be empty",
        });
      }

      if (text.trim().length > 1000) {
        return res.status(400).json({
          message: "Comment must be 1000 characters or fewer",
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const comment = await Comment.create({
        project: projectId,
        user: userId,
        text: text.trim(),
      });

      await comment.populate("user", "name");

      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (error) {
      console.error("Add comment error:", error);

      res.status(500).json({
        message: "Failed to add comment",
      });
    }
  }
);
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});