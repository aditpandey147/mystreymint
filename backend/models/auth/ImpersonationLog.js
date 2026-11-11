// backend/models/ImpersonationLog.js
const mongoose = require("mongoose");

const impersonationLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    adminEmail: { type: String, required: false, default: "(unknown)" },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetEmail: { type: String, required: false, default: "(unknown)" },
    ip: String,
    userAgent: String,
    reason: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImpersonationLog", impersonationLogSchema);