// backend/controllers/characterController.js
const fsp = require("fs/promises");
const path = require("path");
const { chat, image } = require("../services/aiService");
const Mystery = require("../models/Mystery");

// ================================================================
// 📁 UPLOAD PATHS
// ================================================================
const UPLOADS_ROOT = path.join(__dirname, "../uploads/characters");
const PUBLIC_PREFIX = "/uploads/characters";

// ================================================================
// 🧠 PROMPTS
// ================================================================
const CHARACTER_PROMPT = `
You are a master mystery character designer for MysteryMint AI.
Generate ONE richly detailed character for a mystery game.

Return ONLY valid JSON. No markdown, no code fences, no prose outside JSON.
Match the exact shape below. Do not add or rename keys.

Schema:
{
  "name": "string",
  "age": 0,
  "role": "string",
  "occupation": "string",
  "personality": "1 sentence, max 25 words",
  "background": "2 sentences, max 50 words",
  "motive": "1 sentence, max 25 words",
  "alibi": "1 sentence, max 25 words",
  "publicInformation": {
    "appearance": "1 sentence, max 25 words",
    "mannerisms": "1 sentence, max 20 words",
    "knownFacts": ["3 short strings"]
  },
  "privateInformation": {
    "secret": "1 sentence, max 30 words",
    "suspiciousBehavior": "1 sentence, max 25 words",
    "alibiTruth": "1 sentence, max 25 words"
  },
  "portraitPrompt": "max 20 words — cinematic portrait description, no text"
}
`;

const IMAGE_STYLE_SUFFIX =
  ", cinematic mystery character portrait, dramatic lighting, premium quality, no text, no watermark";

// ================================================================
// 🛟 SAFE JSON PARSE
// ================================================================
function safeJsonParse(raw, label = "AI") {
  if (!raw) throw new Error(`${label} returned empty response`);

  let text = String(raw).trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`❌ Failed to parse ${label} JSON:`, text.slice(0, 500));
    throw new Error(`${label} returned invalid JSON`);
  }
}

async function callJson({ systemPrompt, userMessage, label, maxTokens = 2000 }) {
  const MAX_ATTEMPTS = 3;
  let lastErr;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
      console.warn(`🔁 ${label} attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastErr;
}

// ================================================================
// 🖼️ DOWNLOAD & STORE PORTRAIT
// ================================================================
async function downloadAndStore(remoteUrl, userId, filename) {
  if (!remoteUrl) return null;
  try {
    const dir = path.join(UPLOADS_ROOT, String(userId));
    await fsp.mkdir(dir, { recursive: true });

    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    await fsp.writeFile(path.join(dir, filename), buf);

    return `${PUBLIC_PREFIX}/${userId}/${filename}`;
  } catch (err) {
    console.error(`❌ Portrait download failed:`, err.message);
    return null;
  }
}

// ================================================================
// 🎭 GENERATE CHARACTER
// POST /api/characters/generate
// ================================================================
exports.generateCharacter = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const {
      role = "Suspect",
      genre = "Murder Mystery",
      setting = "Luxury Hotel",
      era = "1920s",
      tone = "Serious",
      ageRange = "30-50",
      gender = "Any",
      prompt = "",
      includePortrait = true,
    } = req.body || {};

    const input = { role, genre, setting, era, tone, ageRange, gender, prompt };

    console.log(`🎭 [Character] Generating for user ${userId}…`);

    // ---- 1. Generate character details via DeepSeek ----
    const character = await callJson({
      systemPrompt: CHARACTER_PROMPT,
      userMessage: `Generate a character with these parameters:\n${JSON.stringify(input, null, 2)}`,
      label: "Character",
      maxTokens: 2000,
    });

    // ---- 2. Generate portrait if requested ----
    let portraitUrl = null;
    if (includePortrait && character.portraitPrompt) {
      try {
        const remote = await image({
          prompt: `${character.portraitPrompt}${IMAGE_STYLE_SUFFIX}`,
          aspectRatio: "portrait",
        });
        portraitUrl = await downloadAndStore(
          remote,
          userId,
          `char-${Date.now()}.png`
        );
      } catch (err) {
        console.error("❌ Portrait generation failed:", err.message);
      }
    }

    // ---- 3. Persist character under a synthetic "Character Library" mystery ----
    let library = await Mystery.findOne({
      userId,
      title: "__Character Library__",
    });

    if (!library) {
      library = await Mystery.create({
        userId,
        title: "__Character Library__",
        genre: "Character Library",
        setting: "Library",
        difficulty: "Medium",
        playerCount: "0",
        duration: 0,
        targetAudience: "Internal",
        generationStatus: "completed",
        generationProgress: 100,
        currentStage: "Completed",
        characters: [],
      });
    }

    const newCharacter = {
      id: `CH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: character.name || "Unknown",
      age: Number(character.age) || 30,
      role: character.role || role,
      occupation: character.occupation || "",
      personality: character.personality || "",
      background: character.background || "",
      motive: character.motive || "",
      alibi: character.alibi || "",
      relationships: [],
      isCulprit: false,
      publicInformation: {
        appearance: character.publicInformation?.appearance || "",
        mannerisms: character.publicInformation?.mannerisms || "",
        knownFacts: Array.isArray(character.publicInformation?.knownFacts)
          ? character.publicInformation.knownFacts.filter(Boolean).map(String)
          : [],
      },
      privateInformation: {
        secret: character.privateInformation?.secret || "",
        suspiciousBehavior: character.privateInformation?.suspiciousBehavior || "",
        alibiTruth: character.privateInformation?.alibiTruth || "",
      },
      portraitPrompt: character.portraitPrompt || "",
      portraitUrl,
    };

    library.characters.push(newCharacter);
    await library.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 [Character] Created in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Character generated",
      data: newCharacter,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Character] Generation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Character generation failed",
    });
  }
};

// ================================================================
// 📋 LIST USER'S CHARACTERS
// GET /api/characters
// ================================================================
exports.listCharacters = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const library = await Mystery.findOne({
      userId,
      title: "__Character Library__",
    }).lean();

    return res.json({
      success: true,
      count: library?.characters?.length || 0,
      data: library?.characters || [],
    });
  } catch (err) {
    console.error("❌ List characters failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load characters",
    });
  }
};

// ================================================================
// 🗑️ DELETE CHARACTER
// DELETE /api/characters/:id
// ================================================================
exports.deleteCharacter = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const characterId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const library = await Mystery.findOne({
      userId,
      title: "__Character Library__",
    });

    if (!library) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    library.characters = library.characters.filter((c) => c.id !== characterId);
    await library.save();

    return res.json({ success: true, message: "Character deleted" });
  } catch (err) {
    console.error("❌ Delete character failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete character",
    });
  }
};