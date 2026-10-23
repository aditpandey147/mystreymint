// backend/controllers/mysteryTemplateController.js
const MysteryTemplate = require("../models/MysteryTemplate");

// ================================================================
// 📋 LIST ACTIVE TEMPLATES
// GET /api/templates
// ================================================================
exports.listTemplates = async (req, res) => {
  try {
    const { genre, featured, search } = req.query;

    const query = { isActive: true };

    if (genre && genre !== "All") query.genre = genre;
    if (featured === "true") query.isFeatured = true;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const templates = await MysteryTemplate.find(query)
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (err) {
    console.error("❌ listTemplates failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load templates",
    });
  }
};

// ================================================================
// 🔍 GET SINGLE TEMPLATE
// GET /api/templates/:id
// ================================================================
exports.getTemplate = async (req, res) => {
  try {
    const template = await MysteryTemplate.findById(req.params.id).lean();

    if (!template || !template.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    return res.json({ success: true, data: template });
  } catch (err) {
    console.error("❌ getTemplate failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load template",
    });
  }
};