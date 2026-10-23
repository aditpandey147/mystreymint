// backend/controllers/clueStudioController.js
const fsp = require("fs/promises");
const path = require("path");
const { chat, image } = require("../services/aiService");
const Mystery = require("../models/Mystery");

// ================================================================
// 📁 UPLOAD PATHS
// ================================================================
const UPLOADS_ROOT = path.join(__dirname, "../uploads/clues");
const PUBLIC_PREFIX = "/uploads/clues";

// ================================================================
// 🧠 SYSTEM PROMPTS
// ================================================================
const BASE_RULES = `
You are a master mystery game designer for MysteryMint AI.
Return ONLY valid JSON. No markdown, no code fences, no prose.
`;

const CLUE_PROMPT = `${BASE_RULES}
TASK: Generate ONE rich CLUE for a mystery game.

Schema:
{
  "title": "max 8 words",
  "description": "2 sentences, max 40 words",
  "type": "Physical Evidence|Testimony|Document|Observation|Forensic",
  "importance": "Critical|Major|Minor",
  "discoveryLocation": "1 short phrase",
  "relatedCharacters": ["name or role"],
  "supportsDeduction": "1 short sentence",
  "isRedHerring": false,
  "hint": "1 short sentence, max 20 words",
  "imagePrompt": "max 20 words — cinematic object/scene description, no text"
}
Return ONLY the JSON object.`;

const EVIDENCE_PROMPT = `${BASE_RULES}
TASK: Generate ONE rich EVIDENCE DOCUMENT for a mystery game.

Schema:
{
  "title": "max 8 words",
  "type": "Witness Statement|Letter|Diary Entry|Security Report|Receipt|Record|Newspaper Article|Investigation Report|Photographic Evidence",
  "relatedCharacters": ["name or role"],
  "body": "Full readable text of the document, 60-120 words, formatted with line breaks.",
  "imagePrompt": "max 20 words — cinematic document/photo description, no text"
}
Return ONLY the JSON object.`;

const IMAGE_STYLE_SUFFIX =
  ", cinematic mystery evidence illustration, dramatic lighting, premium quality, no text, no watermark";

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
      console.warn(
        `🔁 ${label} attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastErr;
}

// ================================================================
// 🖼️ DOWNLOAD & STORE IMAGE
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
    console.error(`❌ Image download failed:`, err.message);
    return null;
  }
}

// ================================================================
// 🔧 ENSURE LIBRARY DOC EXISTS
// ================================================================
async function getOrCreateLibrary(userId) {
  let library = await Mystery.findOne({
    userId,
    title: "__Clue Library__",
  });

  if (!library) {
    library = await Mystery.create({
      userId,
      title: "__Clue Library__",
      genre: "Clue Library",
      setting: "Library",
      difficulty: "Medium",
      playerCount: "0",
      duration: 0,
      targetAudience: "Internal",
      generationStatus: "completed",
      generationProgress: 100,
      currentStage: "Completed",
      clues: [],
      evidence: [],
      images: { clues: [], evidence: [] },
    });
  }
  return library;
}

// ================================================================
// 🎭 GENERATE CLUE
// POST /api/clue-studio/clues/generate
// ================================================================
exports.generateClue = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const {
      genre = "Murder Mystery",
      setting = "Luxury Hotel",
      era = "1920s",
      difficulty = "Medium",
      clueType = "Any",
      importance = "Major",
      isRedHerring = false,
      prompt = "",
      includeImage = true,
    } = req.body || {};

    console.log(`🔍 [Clue Studio] Generating clue for user ${userId}…`);

    const clueData = await callJson({
      systemPrompt: CLUE_PROMPT,
      userMessage: `Generate a clue with these parameters:\n${JSON.stringify(
        { genre, setting, era, difficulty, clueType, importance, isRedHerring, prompt },
        null,
        2
      )}`,
      label: "Clue",
      maxTokens: 1500,
    });

    // Optional: generate a visual for the clue
    let imageUrl = null;
    if (includeImage && clueData.imagePrompt) {
      try {
        const remote = await image({
          prompt: `${clueData.imagePrompt}${IMAGE_STYLE_SUFFIX}`,
          aspectRatio: "square",
        });
        imageUrl = await downloadAndStore(
          remote,
          userId,
          `clue-${Date.now()}.png`
        );
      } catch (err) {
        console.error("❌ Clue image generation failed:", err.message);
      }
    }

    const newClue = {
      id: `CL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: clueData.title || "Untitled Clue",
      description: clueData.description || "",
      type: clueData.type || clueType || "Physical Evidence",
      importance: clueData.importance || importance || "Major",
      discoveryLocation: clueData.discoveryLocation || "",
      relatedCharacters: Array.isArray(clueData.relatedCharacters)
        ? clueData.relatedCharacters.filter(Boolean).map(String)
        : [],
      supportsDeduction: clueData.supportsDeduction || "",
      isRedHerring: clueData.isRedHerring === true,
      hint: clueData.hint || "",
      imageUrl,
    };

    const library = await getOrCreateLibrary(userId);
    library.clues.push(newClue);
    await library.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 [Clue Studio] Clue created in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Clue generated",
      data: newClue,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Clue Studio] Clue generation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Clue generation failed",
    });
  }
};

// ================================================================
// 📜 GENERATE EVIDENCE
// POST /api/clue-studio/evidence/generate
// ================================================================
exports.generateEvidence = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const {
      genre = "Murder Mystery",
      setting = "Luxury Hotel",
      era = "1920s",
      evidenceType = "Any",
      prompt = "",
      includeImage = true,
    } = req.body || {};

    console.log(`📜 [Clue Studio] Generating evidence for user ${userId}…`);

    const evidenceData = await callJson({
      systemPrompt: EVIDENCE_PROMPT,
      userMessage: `Generate an evidence document with these parameters:\n${JSON.stringify(
        { genre, setting, era, evidenceType, prompt },
        null,
        2
      )}`,
      label: "Evidence",
      maxTokens: 2500,
    });

    let imageUrl = null;
    if (includeImage && evidenceData.imagePrompt) {
      try {
        const remote = await image({
          prompt: `${evidenceData.imagePrompt}${IMAGE_STYLE_SUFFIX}`,
          aspectRatio: "portrait",
        });
        imageUrl = await downloadAndStore(
          remote,
          userId,
          `evidence-${Date.now()}.png`
        );
      } catch (err) {
        console.error("❌ Evidence image generation failed:", err.message);
      }
    }

    const newEvidence = {
      id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: evidenceData.title || "Untitled Evidence",
      type: evidenceData.type || evidenceType || "Document",
      relatedCharacters: Array.isArray(evidenceData.relatedCharacters)
        ? evidenceData.relatedCharacters.filter(Boolean).map(String)
        : [],
      body: evidenceData.body || "",
      imageUrl,
    };

    const library = await getOrCreateLibrary(userId);
    library.evidence.push(newEvidence);
    await library.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 [Clue Studio] Evidence created in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Evidence generated",
      data: newEvidence,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Clue Studio] Evidence generation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Evidence generation failed",
    });
  }
};

// ================================================================
// 📋 LIST EVERYTHING
// GET /api/clue-studio
// ================================================================
exports.listAll = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const library = await Mystery.findOne({
      userId,
      title: "__Clue Library__",
    }).lean();

    return res.json({
      success: true,
      clues: library?.clues || [],
      evidence: library?.evidence || [],
      counts: {
        clues: library?.clues?.length || 0,
        evidence: library?.evidence?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ List failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load",
    });
  }
};

// ================================================================
// 🗑️ DELETE
// DELETE /api/clue-studio/clues/:id
// DELETE /api/clue-studio/evidence/:id
// ================================================================
exports.deleteClue = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const library = await Mystery.findOne({
      userId,
      title: "__Clue Library__",
    });
    if (!library) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    library.clues = (library.clues || []).filter((c) => c.id !== id);
    await library.save();

    return res.json({ success: true, message: "Clue deleted" });
  } catch (err) {
    console.error("❌ Delete clue failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete",
    });
  }
};

exports.deleteEvidence = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const library = await Mystery.findOne({
      userId,
      title: "__Clue Library__",
    });
    if (!library) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    library.evidence = (library.evidence || []).filter((e) => e.id !== id);
    await library.save();

    return res.json({ success: true, message: "Evidence deleted" });
  } catch (err) {
    console.error("❌ Delete evidence failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete",
    });
  }
};