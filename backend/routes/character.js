// backend/routes/character.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generateCharacter,
  listCharacters,
  deleteCharacter,
} = require("../controllers/characterController");

router.post("/generate", auth, generateCharacter);
router.get("/", auth, listCharacters);
router.delete("/:id", auth, deleteCharacter);

module.exports = router;