// 



































const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },

    avgScore:        { type: Number, default: 0 },
    bestScore:       { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    level:           { type: String, default: "beginner" },

    // ✅ FIXED: Dynamic Map — koi bhi skill save ho sakti hai
    // Web dev ke liye: reactjs, nodejs, css...
    // ML ke liye: python, machinelearning, deeplearning...
    // DevOps ke liye: docker, kubernetes, aws...
    skills: {
      type: Map,
      of: Number,
      default: {},
    },

    // ✅ Resume context fields
    resumeText:      { type: String, default: "" },
    resumeSummary:   { type: String, default: "" },
    experienceLevel: { type: String, default: "junior" }, // fresher | junior | mid | senior
    primaryStack:    { type: String, default: "" },       // e.g. "Python/ML", "MERN", "DevOps/AWS"

    history: [
      {
        score: Number,
        date:  Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);