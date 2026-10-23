// backend/routes/dfyPack.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { listPacks, downloadPack } = require("../controllers/dfyPackController");

// Public list — no auth needed so anyone can browse
router.get("/", listPacks);

// Download requires auth (prevents hotlinking)
router.get("/:id/download", auth, downloadPack);

module.exports = router;