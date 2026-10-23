// backend/models/MysteryTemplate.js
const mongoose = require("mongoose");

const mysteryTemplateSchema = new mongoose.Schema(
  {
    // ---------- BASIC INFO ----------
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },

    // ---------- PRESET INPUTS (pre-fills the Create Mystery form) ----------
    genre: {
      type: String,
      required: true,
      enum: [
        "Murder Mystery",
        "Detective Mystery",
        "Treasure Hunt",
        "Spy Thriller",
        "Horror Mystery",
        "Sci-Fi Mystery",
      ],
    },
    setting: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    playerCount: { type: String, default: "4-8" },
    duration: { type: Number, default: 60 },
    targetAudience: { type: String, default: "Adults" },

    // Optional pre-written story seed
    storyIdea: { type: String, default: "" },

    // ---------- VISUAL ----------
    thumbnail: { type: String, default: null }, // relative path

    // ---------- TAXONOMY ----------
    tags: { type: [String], default: [] },
    category: { type: String, default: "General" },

    // ---------- VISIBILITY / FLAGS ----------
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    // ---------- SORTING ----------
    order: { type: Number, default: 0 },

    // ---------- GENERATION HINTS (optional, advanced) ----------
    generationInstructions: { type: String, default: "" },
    visualStyle: { type: String, default: "" },
  },
  { timestamps: true }
);

mysteryTemplateSchema.index({ genre: 1 });
mysteryTemplateSchema.index({ isActive: 1, isFeatured: 1, order: 1 });

module.exports = mongoose.model("MysteryTemplate", mysteryTemplateSchema);