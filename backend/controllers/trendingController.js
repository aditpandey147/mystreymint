// backend/controllers/trendingController.js
const { chat } = require("../services/aiService");

// ================================================================
// 🧠 PROMPT — generate 10 trending mystery ideas
// ================================================================
const IDEAS_PROMPT = `
You are a mystery-game trend analyst for MysteryMint AI.
Given a search query, generate 10 fresh, marketable mystery game ideas
that match the query and would trend on platforms like Etsy, Pinterest,
TikTok, and Amazon KDP.

Return ONLY valid JSON. No markdown. No code fences. No prose.

Rules:
- All 10 ideas must be UNIQUE and directly relevant to the search query.
- If the query is empty, generate 10 broadly trending mystery ideas.
- Mix of categories: Murder Mystery, Detective Case, Escape Room, Party Game,
  Treasure Hunt, Kids & Family, Holiday Special, Adventure.
- Each idea must have a strong hook a buyer would click on.

Schema:
{
  "ideas": [
    {
      "title": "max 8 words, catchy",
      "description": "1-2 sentences, max 25 words",
      "category": "Murder Mystery|Detective Case|Escape Room|Party Game|Treasure Hunt|Kids & Family|Holiday Special|Adventure",
      "genre": "string (e.g. Murder Mystery, Horror Mystery, Detective Mystery)",
      "setting": "max 4 words (e.g. Victorian Manor, Luxury Cruise)",
      "popularity": 60-99,
      "searches": "e.g. 7.2K",
      "growth": 15-60,
      "difficulty": "Easy|Medium|Hard",
      "playerCount": "4-6|4-8|6-10|8-12",
      "duration": 60,
      "targetAudience": "Adults|Families|Kids",
      "storyIdea": "2-3 sentences, max 60 words — the full story seed for AI generation"
    }
  ]
}

Sort ideas by descending popularity. First idea should be the strongest.
Return exactly 10 ideas.
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
    console.error(`❌ Failed to parse ${label} JSON:`, text.slice(0, 500));
    throw new Error(`${label} returned invalid JSON`);
  }
}

async function callJson({ systemPrompt, userMessage, label, maxTokens = 4000 }) {
  const MAX = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      const raw = await chat({
        systemPrompt,
        userMessage,
        temperature: 0.9,
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
// 🔍 SEARCH + GENERATE
// POST /api/trending/search
// ================================================================
exports.searchTrending = async (req, res) => {
  const startedAt = Date.now();

  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const { query = "", category = "All", difficulty = "All Levels" } =
      req.body || {};

    console.log(
      `🔥 [Trending] Generating ideas for query="${query}" category="${category}" difficulty="${difficulty}"`
    );

    // Build the user message
    const filters = [];
    if (category && category !== "All") filters.push(`Category: ${category}`);
    if (difficulty && difficulty !== "All Levels")
      filters.push(`Difficulty: ${difficulty}`);

    const userMessage = query.trim()
      ? `Search query: "${query.trim()}"\n${
          filters.length ? filters.join("\n") : ""
        }\n\nGenerate 10 fresh mystery ideas matching this query.`
      : `No query — generate the 10 currently most-trending mystery game ideas.\n${
          filters.length ? filters.join("\n") : ""
        }`;

    const result = await callJson({
      systemPrompt: IDEAS_PROMPT,
      userMessage,
      label: "Trending Ideas",
      maxTokens: 4000,
    });

    const ideas = Array.isArray(result.ideas) ? result.ideas : [];
    if (ideas.length === 0) {
      throw new Error("AI returned no ideas");
    }

    // Normalize + add ids
    const normalized = ideas.map((idea, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      title: String(idea.title || "Untitled Mystery").slice(0, 80),
      description: String(idea.description || "").slice(0, 180),
      category: idea.category || "Murder Mystery",
      genre: idea.genre || "Murder Mystery",
      setting: idea.setting || "Mystery Location",
      popularity: Math.max(60, Math.min(99, Number(idea.popularity) || 75)),
      searches: String(idea.searches || "1.0K"),
      growth: Math.max(10, Math.min(60, Number(idea.growth) || 20)),
      difficulty: ["Easy", "Medium", "Hard"].includes(idea.difficulty)
        ? idea.difficulty
        : "Medium",
      playerCount: idea.playerCount || "4-8",
      duration: Number(idea.duration) || 90,
      targetAudience: idea.targetAudience || "Adults",
      storyIdea: String(idea.storyIdea || "").slice(0, 400),
    }));

    // Sort by popularity
    normalized.sort((a, b) => b.popularity - a.popularity);

    const elapsedMs = Date.now() - startedAt;
    console.log(
      `🎉 [Trending] ${normalized.length} ideas generated in ${(elapsedMs / 1000).toFixed(1)}s`
    );

    return res.json({
      success: true,
      query: query.trim(),
      count: normalized.length,
      data: normalized,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Trending] Failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate ideas",
    });
  }
};