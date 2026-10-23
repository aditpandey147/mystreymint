// backend/controllers/partyPlannerController.js
const { chat } = require("../services/aiService");
const Mystery = require("../models/Mystery");

// ================================================================
// 🧠 PROMPT
// ================================================================
const PARTY_PLAN_PROMPT = `
You are a world-class event planner specializing in murder-mystery
parties. You create complete, actionable party plans that hosts can
run without prior experience.

RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no prose outside JSON.
2. Match the exact schema below. Do NOT add or rename keys.
3. Keep everything realistic and grounded in the mystery data.
4. NEVER invent facts not present in the mystery data.
5. All durations and schedules must add up consistently.
6. Character assignments must use characters from the mystery — never invent names.

Schema:
{
  "partyTheme": "1 line — the vibe of the night, max 12 words",
  "partyDurationMinutes": 180,
  "recommendedStartTime": "e.g. 7:00 PM",
  "totalGuests": 6,

  "invitation": {
    "headline": "max 10 words",
    "body": "120-180 words — full invitation copy",
    "dressCode": "1 sentence",
    "rsvpLine": "1 short line",
    "whatToBring": ["2-3 short items"]
  },

  "preparationTimeline": [
    {
      "when": "3 days before",
      "tasks": ["3-4 short actionable tasks"]
    }
  ],

  "characterAssignments": [
    {
      "characterName": "must match a mystery character",
      "role": "role from mystery",
      "guestSlot": "e.g. 'Player 1' or 'The Host'",
      "whyThisGuest": "1 short sentence on who would enjoy this role",
      "recommendedPlayerType": "1 phrase"
    }
  ],

  "partySchedule": [
    {
      "time": "7:00 PM",
      "duration": "20 min",
      "activity": "Guest arrival & cocktails",
      "hostNotes": "1 short sentence for the GM"
    }
  ],

  "foodAndDrink": {
    "cocktailIdeas": ["3 drinks, each with a name and 1-line description"],
    "appetizers": ["4 appetizers, each max 15 words"],
    "mains": ["1 main dish idea"],
    "dessert": ["1 dessert idea"],
    "dietaryNotes": "1 sentence"
  },

  "decorations": {
    "colorPalette": ["3-4 colors"],
    "propIdeas": ["4-5 props, each max 12 words"],
    "lightingNotes": "1 sentence",
    "soundtrackIdeas": ["3 song/playlist ideas"]
  },

  "icebreakers": [
    {
      "name": "short title",
      "duration": "5-10 min",
      "description": "2 sentences",
      "when": "e.g. 'during cocktails'"
    }
  ],

  "gameMasterRunSheet": [
    {
      "phase": "Setup | Arrival | Story | Investigation | Accusation | Reveal",
      "time": "7:00 PM",
      "whatToDo": "2 sentences for the GM",
      "whatToSay": "1 short cue line the GM can read aloud"
    }
  ],

  "partyFavors": ["3 favors, each max 15 words"],

  "contingencyTips": ["3 practical tips for when things go sideways"]
}

Return ONLY the JSON object.
`;

// ================================================================
// 🛟 SAFE JSON PARSE
// ================================================================
function safeJsonParse(raw, label = "AI") {
  if (!raw) throw new Error(`${label} returned empty response`);
  let text = String(raw).trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`❌ Failed to parse ${label} JSON:`, text.slice(0, 800));
    throw new Error(`${label} returned invalid JSON`);
  }
}

async function callJson({ systemPrompt, userMessage, label, maxTokens = 8000 }) {
  const MAX = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      const raw = await chat({
        systemPrompt,
        userMessage,
        temperature: 0.85,
        maxTokens,
      });
      return safeJsonParse(raw, label);
    } catch (err) {
      lastErr = err;
      console.warn(`🔁 ${label} attempt ${attempt}/${MAX} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastErr;
}

// ================================================================
// 🎯 GENERATE PARTY PLAN
// POST /api/party-planner/generate
// ================================================================
exports.generatePartyPlan = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const {
      mysteryId,
      partyDate = "",
      partyTime = "7:00 PM",
      guestCount = 6,
      venue = "Home",
      partyStyle = "Classic 1920s",
      foodPreferences = "No restrictions",
      includeCostumes = true,
      prompt = "",
    } = req.body || {};

    if (!mysteryId) {
      return res
        .status(400)
        .json({ success: false, message: "mysteryId is required" });
    }

    const mystery = await Mystery.findOne({ _id: mysteryId, userId }).lean();
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    console.log(
      `🎉 [Party Planner] Planning for "${mystery.title}" — ${guestCount} guests`
    );

    // Compact mystery summary
    const characters = (mystery.characters || []).map((c) => ({
      name: c.name,
      role: c.role,
      age: c.age,
      occupation: c.occupation,
      personality: c.personality?.slice(0, 120) || "",
    }));

    const mysterySummary = {
      title: mystery.title,
      genre: mystery.genre,
      setting: mystery.setting,
      difficulty: mystery.difficulty,
      playerCount: mystery.playerCount,
      duration: mystery.duration,
      targetAudience: mystery.targetAudience,
      storyIdea: mystery.storyIdea || "",
      storyIntroduction: mystery.story?.introduction?.slice(0, 300) || "",
      characters,
      puzzleCount: mystery.puzzles?.length || 0,
      clueCount: mystery.clues?.length || 0,
    };

    const userMessage = `Create a complete murder-mystery party plan:

MYSTERY:
${JSON.stringify(mysterySummary, null, 2)}

PARTY DETAILS:
- Party date: ${partyDate || "TBD"}
- Start time: ${partyTime}
- Guest count: ${guestCount}
- Venue: ${venue}
- Party style: ${partyStyle}
- Food preferences: ${foodPreferences}
- Include costume suggestions: ${includeCostumes ? "yes" : "no"}
- Extra notes from host: ${prompt || "none"}

Plan the entire party — from invitations 2 weeks out through the reveal.
Every character in the mystery must get a role assignment.
Every party schedule item must add up to a complete evening.
Return ONLY the JSON object.`;

    const plan = await callJson({
      systemPrompt: PARTY_PLAN_PROMPT,
      userMessage,
      label: "Party Plan",
      maxTokens: 8000,
    });

    const elapsedMs = Date.now() - startedAt;
    console.log(
      `🎉 [Party Planner] Plan ready in ${(elapsedMs / 1000).toFixed(1)}s`
    );

    return res.json({
      success: true,
      message: "Party plan generated",
      data: {
        mysteryId: mystery._id,
        mysteryTitle: mystery.title,
        mysteryCover: mystery.images?.cover || null,
        partyDate,
        partyTime,
        guestCount,
        venue,
        partyStyle,
        includeCostumes,
        plan,
      },
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Party Planner] Failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Generation failed",
    });
  }
};