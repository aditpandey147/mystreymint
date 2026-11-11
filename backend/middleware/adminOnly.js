// backend/middleware/adminOnly.js
module.exports = function adminOnly(req, res, next) {
  // `req.user` must already be populated by your auth middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};