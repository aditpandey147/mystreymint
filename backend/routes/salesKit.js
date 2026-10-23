// backend/routes/salesKit.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { generateSalesKit } = require("../controllers/salesKitController");

router.post("/generate", auth, generateSalesKit);

module.exports = router;