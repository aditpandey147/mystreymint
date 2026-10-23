// backend/routes/partyPlanner.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { generatePartyPlan } = require("../controllers/partyPlannerController");

router.post("/generate", auth, generatePartyPlan);

module.exports = router;