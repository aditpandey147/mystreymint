// backend/routes/escapeRoom.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generateEscapeRoom,
  listEscapeRooms,
  deleteEscapeRoom,
} = require("../controllers/escapeRoomController");

router.get("/", auth, listEscapeRooms);
router.post("/generate", auth, generateEscapeRoom);
router.delete("/:id", auth, deleteEscapeRoom);

module.exports = router;