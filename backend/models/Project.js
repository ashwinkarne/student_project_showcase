
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: {
      type: [String],
      default: []
    },
    githubUrl: {
      type: String,
      required: true
    },
    liveDemoUrl: {
      type: String,
      default: ""
    },
    coverImage: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);