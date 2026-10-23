// backend/models/Export.js
const mongoose = require("mongoose");

const exportSchema = new mongoose.Schema(
  {
    // ---------- OWNERSHIP ----------
    mysteryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mystery",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ---------- TYPE ----------
    // "pdf"   → single PDF (story, suspects, clues, puzzles, solution, instructions)
    // "zip"   → complete kit bundle
    // "image" → standalone cover PNG
    type: {
      type: String,
      enum: ["pdf", "zip", "image"],
      required: true,
    },

    // For type="pdf": which PDF
    // "story" | "suspects" | "clues" | "puzzles" | "solution" | "instructions"
    // For type="image": "cover"
    // For type="zip": "complete_kit"
    kind: { type: String, default: "" },

    // ---------- FILE INFO ----------
    filePath: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "application/octet-stream" },

    // ---------- STATUS ----------
    status: {
      type: String,
      enum: ["building", "ready", "failed"],
      default: "building",
      index: true,
    },
    error: { type: String, default: null },

    buildStartedAt: { type: Date, default: Date.now },
    buildCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

exportSchema.index({ userId: 1, createdAt: -1 });
exportSchema.index({ mysteryId: 1, type: 1, kind: 1 });
exportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Export", exportSchema);