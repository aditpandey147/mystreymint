// backend/routes/export.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  buildExports,
  downloadExport,
  listExports,
} = require("../controllers/exportController");

// Build all exports for a mystery (PDFs + cover + ZIP)
router.post("/mysteries/:id/export", auth, buildExports);

// List exports for a mystery
router.get("/mysteries/:id/exports", auth, listExports);

// Download a specific export (PDF, ZIP, or image)
router.get("/exports/:id/download", auth, downloadExport);

module.exports = router;