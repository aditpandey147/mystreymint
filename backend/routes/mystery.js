// backend/routes/mystery.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generateMystery,
  testBlueprint,
  listMysteries,
  getMystery,
  getMysteryStatus,
  deleteMystery,
  getPdfStatus,
  viewMysteryPdf,
  downloadMysteryPdf,
} = require("../controllers/mysteryController");

const {
  buildExports,
  listExports,
} = require("../controllers/exportController");

// Generation
router.post("/generate", auth, generateMystery);
router.post("/test-blueprint", testBlueprint);

// Listing & detail
router.get("/", auth, listMysteries);
router.get("/:id", auth, getMystery);
router.get("/:id/status", auth, getMysteryStatus);
router.delete("/:id", auth, deleteMystery);

// Exports (mystery-scoped)
router.post("/:id/export", auth, buildExports);
router.get("/:id/exports", auth, listExports);

// ================================================================
// 📄 Per-section PDF endpoints
// ================================================================
router.get("/:id/pdf/status", auth, getPdfStatus);
router.get("/:id/pdf/:kind", auth, viewMysteryPdf);
router.get("/:id/pdf/:kind/download", auth, downloadMysteryPdf);

module.exports = router;