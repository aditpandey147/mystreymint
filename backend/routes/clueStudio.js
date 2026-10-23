// backend/routes/clueStudio.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generateClue,
  generateEvidence,
  listAll,
  deleteClue,
  deleteEvidence,
} = require("../controllers/clueStudioController");

router.get("/", auth, listAll);
router.post("/clues/generate", auth, generateClue);
router.post("/evidence/generate", auth, generateEvidence);
router.delete("/clues/:id", auth, deleteClue);
router.delete("/evidence/:id", auth, deleteEvidence);

module.exports = router;