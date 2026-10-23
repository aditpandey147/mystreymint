// backend/routes/mysteryTemplate.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listTemplates,
  getTemplate,
} = require("../controllers/mysteryTemplateController");

router.get("/", auth, listTemplates);
router.get("/:id", auth, getTemplate);

module.exports = router;