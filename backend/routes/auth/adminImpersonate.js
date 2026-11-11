// backend/routes/auth/adminImpersonate.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/auth/User");
const ImpersonationLog = require("../../models/auth/ImpersonationLog");
const authMiddleware = require("../../middleware/auth");
const adminOnly = require("../../middleware/adminOnly");
const router = express.Router();

router.post(
  "/impersonate/:userId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const reason = (req.body?.reason || "").slice(0, 500);

      const adminId = req.user?.id || req.user?.userId || req.user?._id;
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Admin identity missing from token" });
      }

      const admin = await User.findById(adminId).lean();
      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: "Admin account not found" });
      }
      if (admin.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Admin access required" });
      }

      const target = await User.findById(userId).lean();
      if (!target) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (target._id.toString() === admin._id.toString()) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot impersonate yourself" });
      }
      if (target.role === "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Cannot impersonate another admin" });
      }

      const IMPERSONATION_TTL = "1h";

      // ✅ MATCH YOUR NORMAL LOGIN TOKEN SHAPE:
      // auth.js does req.user = decoded.user, so everything
      // the user needs must be nested under `user`.
      const token = jwt.sign(
        {
          user: {
            id: target._id,
            _id: target._id,
            email: target.email,
            name: target.name,
            role: target.role,
            planId: target.planId,
            planName: target.planName,
          },
          impersonatedBy: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
          },
        },
        process.env.JWT_SECRET,
        { expiresIn: IMPERSONATION_TTL }
      );

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await ImpersonationLog.create({
        adminId: admin._id,
        adminEmail: admin.email,
        targetUserId: target._id,
        targetEmail: target.email,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "",
        reason,
        expiresAt,
      });

      console.log(
        `🕵️  Admin ${admin.email} impersonating ${target.email} (${IMPERSONATION_TTL}, ip=${req.ip})`
      );

      return res.json({
        success: true,
        message: `Now logged in as ${target.name} (${target.email})`,
        token,
        expiresIn: IMPERSONATION_TTL,
        user: {
          id: target._id,
          _id: target._id,
          name: target.name,
          email: target.email,
          role: target.role,
          planId: target.planId,
          planName: target.planName,
        },
        impersonatedBy: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (err) {
      console.error("❌ Impersonation failed:", err);
      res
        .status(500)
        .json({ success: false, message: err.message || "Impersonation failed" });
    }
  }
);

router.get(
  "/impersonation-logs",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const logs = await ImpersonationLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;