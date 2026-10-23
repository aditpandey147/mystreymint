// backend/routes/puzzleStudio.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generatePuzzle,
  listPuzzles,
  deletePuzzle,
} = require("../controllers/puzzleStudioController");

router.get("/", auth, listPuzzles);
router.post("/generate", auth, generatePuzzle);
router.delete("/:id", auth, deletePuzzle);

module.exports = router;