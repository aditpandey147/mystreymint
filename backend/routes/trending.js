// backend/routes/trending.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { searchTrending } = require("../controllers/trendingController");

router.post("/search", auth, searchTrending);

module.exports = router;