// backend/controllers/salesKitController.js
const { chat } = require("../services/aiService");
const Mystery = require("../models/Mystery");

// ================================================================
// 🧠 PROMPT
// ================================================================
const SALES_KIT_PROMPT = `
You are a world-class conversion copywriter for digital products on
mystery games. You write high-converting sales copy for each platform,
tailored to that platform's audience, character limits, and conventions.

RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no prose outside JSON.
2. Match the exact schema below. Do NOT add or rename keys.
3. Each platform has its own personality — Etsy is warm and SEO-friendly,
   Gumroad is punchy, Pinterest is aesthetic, TikTok is casual/hook-driven,
   etc.
4. NEVER invent facts not present in the mystery data.
5. Respect all character/word limits.

Schema:
{
  "masterTagline": "max 12 words",
  "productSummary": "2 sentences, max 50 words",
  "keySellingPoints": ["4 short bullets, each max 15 words"],
  "targetAudience": "1 sentence, max 25 words",
  "platforms": {
    "etsy": {
      "title": "max 140 characters, SEO-optimized",
      "description": "200-300 words, warm and inviting, with line breaks",
      "tags": ["13 SEO tags, each max 20 chars"],
      "price": "price suggestion with $ sign"
    },
    "gumroad": {
      "headline": "max 60 chars",
      "description": "150-200 words, punchy and direct",
      "bullets": ["4 benefit bullets, each max 12 words"],
      "price": "price suggestion with $ sign"
    },
    "amazon_kdp": {
      "title": "max 200 chars, keyword-rich",
      "subtitle": "max 200 chars",
      "description": "300-400 words, formatted with line breaks",
      "keywords": ["7 SEO keywords, each max 50 chars"],
      "categories": ["3 categories, each max 40 chars"],
      "price": "price suggestion with $ sign"
    },
    "fiverr": {
      "title": "I will ..., max 80 chars",
      "description": "150-250 words, service-oriented",
      "tags": ["5 tags, each max 20 chars"],
      "price": "price suggestion with $ sign"
    },
    "pinterest": {
      "pinTitle": "max 100 chars, curiosity-driven",
      "pinDescription": "max 500 chars, keyword-rich",
      "boardIdeas": ["3 board names"],
      "hashtags": ["8 hashtags"]
    },
    "tiktok": {
      "caption": "max 150 chars, hook-driven",
      "hook": "first 3 seconds text, max 12 words",
      "videoIdeas": ["3 video concept ideas, each max 20 words"],
      "hashtags": ["10 hashtags"]
    },
    "instagram": {
      "caption": "max 2200 chars, formatted with line breaks and emojis",
      "hook": "opening line, max 12 words",
      "hashtags": ["20 hashtags"],
      "cta": "max 15 words"
    },
    "facebook": {
      "postText": "150-200 words, community-focused",
      "hook": "opening line, max 12 words",
      "hashtags": ["5 hashtags"]
    },
    "linkedin": {
      "postText": "200-250 words, professional angle",
      "hook": "opening line, max 12 words",
      "hashtags": ["5 hashtags"]
    },
    "blog": {
      "title": "max 80 chars, SEO-friendly",
      "excerpt": "max 200 chars",
      "intro": "150-200 words opening",
      "outline": ["5 section headings"],
      "keywords": ["8 SEO keywords"]
    }
  }
}

Platform-specific guidance:
- Etsy: prioritize discoverability and gift-giving angles, warm tone
- Gumroad: direct, benefit-led, sell the outcome
- Amazon KDP: long-form description, keyword-stuffed title, categories matter
- Fiverr: sell YOUR service (you'll create a custom mystery for them)
- Pinterest: visual-first, hooks that make people click
- TikTok: first 3 words must stop the scroll
- Instagram: scroll-stopping hook, then value, then CTA
- Facebook: community, sharing, invite people to play
- LinkedIn: professional angle (team building, corporate events, education)
- Blog: SEO-rich intro + structured outline for a full article

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
// 🎯 GENERATE SALES KIT
// POST /api/sales-kit/generate
// ================================================================
exports.generateSalesKit = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { mysteryId, platforms = [] } = req.body || {};

    if (!mysteryId) {
      return res
        .status(400)
        .json({ success: false, message: "mysteryId is required" });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Select at least one platform" });
    }

    const mystery = await Mystery.findOne({ _id: mysteryId, userId }).lean();
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    console.log(
      `🎨 [Sales Kit] Generating for "${mystery.title}" — platforms: ${platforms.join(", ")}`
    );

    // Build a compact mystery summary for the AI
    const mysterySummary = {
      title: mystery.title,
      genre: mystery.genre,
      setting: mystery.setting,
      difficulty: mystery.difficulty,
      playerCount: mystery.playerCount,
      duration: mystery.duration,
      targetAudience: mystery.targetAudience,
      storyIdea: mystery.storyIdea || "",
      characterCount: mystery.characters?.length || 0,
      clueCount: mystery.clues?.length || 0,
      puzzleCount: mystery.puzzles?.length || 0,
      evidenceCount: mystery.evidence?.length || 0,
      storyExcerpt: mystery.story?.introduction?.slice(0, 400) || "",
    };

    const userMessage = `Generate a complete sales kit for this mystery:\n\n${JSON.stringify(
      mysterySummary,
      null,
      2
    )}\n\nGenerate copy for these platforms ONLY:\n${platforms
      .map((p) => `- ${p}`)
      .join("\n")}\n\nFor any platform NOT in this list, return an empty object.`;

    const result = await callJson({
      systemPrompt: SALES_KIT_PROMPT,
      userMessage,
      label: "Sales Kit",
      maxTokens: 8000,
    });

    // Filter out platforms the user didn't select (in case AI returned extras)
    const filteredPlatforms = {};
    platforms.forEach((p) => {
      if (result.platforms?.[p]) {
        filteredPlatforms[p] = result.platforms[p];
      }
    });

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 [Sales Kit] Generated in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Sales kit generated",
      data: {
        mysteryId: mystery._id,
        mysteryTitle: mystery.title,
        masterTagline: result.masterTagline || "",
        productSummary: result.productSummary || "",
        keySellingPoints: result.keySellingPoints || [],
        targetAudience: result.targetAudience || "",
        platforms: filteredPlatforms,
      },
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Sales Kit] Generation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Generation failed",
    });
  }
};