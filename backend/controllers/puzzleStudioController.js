// backend/controllers/puzzleStudioController.js
const fsp = require("fs/promises");
const path = require("path");
const { chat, image } = require("../services/aiService");
const Mystery = require("../models/Mystery");

const UPLOADS_ROOT = path.join(__dirname, "../uploads/puzzles");
const PUBLIC_PREFIX = "/uploads/puzzles";

// ================================================================
// 🧠 PROMPTS
// ================================================================
const BASE_RULES = `
You are a master puzzle designer for MysteryMint AI.
Return ONLY valid JSON. No markdown, no code fences, no prose.
`;

const PUZZLE_PROMPT = `${BASE_RULES}
TASK: Generate ONE rich puzzle for a mystery game.

Requirements:
- puzzleData must be SMALL and self-contained (a short ciphertext + shift,
  a short ordered list, a compact grid, etc.)
- question: max 40 words
- answer: max 15 words
- explanation: max 40 words
- exactly 3 hints, each max 15 words
- If it's a Cipher, include ciphertext + shift in puzzleData
- If it's a Riddle, include only the riddle text
- If it's a Logic grid, include a small grid
- If it's a Timeline, include a short list of items
- Never include full character biographies or long narratives

Schema:
{
  "title": "max 6 words",
  "type": "Cipher|Riddle|Logic|Deduction|Pattern|Timeline|Relationship|Math",
  "difficulty": "Easy|Medium|Hard",
  "question": "max 40 words",
  "puzzleData": {},
  "answer": "max 15 words",
  "explanation": "max 40 words",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "imagePrompt": "max 20 words — cinematic puzzle visual, no text"
}
Return ONLY the JSON object.`;

const IMAGE_STYLE_SUFFIX =
  ", cinematic mystery puzzle illustration, dramatic lighting, premium quality, no text, no watermark";

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

async function callJson({ systemPrompt, userMessage, label, maxTokens = 2500 }) {
  const MAX = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      const raw = await chat({ systemPrompt, userMessage, temperature: 0.85, maxTokens });
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
// 🖼️ DOWNLOAD & STORE
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
// 🔧 ENSURE LIBRARY DOC
// ================================================================
async function getOrCreateLibrary(userId) {
  let lib = await Mystery.findOne({ userId, title: "__Puzzle Library__" });
  if (!lib) {
    lib = await Mystery.create({
      userId,
      title: "__Puzzle Library__",
      genre: "Puzzle Library",
      setting: "Library",
      difficulty: "Medium",
      playerCount: "0",
      duration: 0,
      targetAudience: "Internal",
      generationStatus: "completed",
      generationProgress: 100,
      currentStage: "Completed",
      puzzles: [],
    });
  }
  return lib;
}

// ================================================================
// 🎯 GENERATE PUZZLE
// POST /api/puzzle-studio/generate
// ================================================================
exports.generatePuzzle = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const {
      genre = "Murder Mystery",
      setting = "Luxury Hotel",
      difficulty = "Medium",
      puzzleType = "Any",
      tone = "Serious",
      prompt = "",
      includeImage = true,
    } = req.body || {};

    console.log(`🧩 [Puzzle Studio] Generating for ${userId}…`);

    const puzzleData = await callJson({
      systemPrompt: PUZZLE_PROMPT,
      userMessage: `Generate a puzzle with these parameters:\n${JSON.stringify(
        { genre, setting, difficulty, puzzleType, tone, prompt },
        null,
        2
      )}`,
      label: "Puzzle",
      maxTokens: 2500,
    });

    let imageUrl = null;
    if (includeImage && puzzleData.imagePrompt) {
      try {
        const remote = await image({
          prompt: `${puzzleData.imagePrompt}${IMAGE_STYLE_SUFFIX}`,
          aspectRatio: "square",
        });
        imageUrl = await downloadAndStore(
          remote,
          userId,
          `puzzle-${Date.now()}.png`
        );
      } catch (err) {
        console.error("❌ Puzzle image failed:", err.message);
      }
    }

    const newPuzzle = {
      id: `PZ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: puzzleData.title || "Untitled Puzzle",
      type: puzzleData.type || puzzleType || "Riddle",
      difficulty: puzzleData.difficulty || difficulty || "Medium",
      question: puzzleData.question || "",
      puzzleData: puzzleData.puzzleData || {},
      answer: puzzleData.answer || "",
      explanation: puzzleData.explanation || "",
      hints: Array.isArray(puzzleData.hints)
        ? puzzleData.hints.filter(Boolean).map(String).slice(0, 3)
        : [],
      imageUrl,
    };

    const library = await getOrCreateLibrary(userId);
    library.puzzles.push(newPuzzle);
    await library.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 [Puzzle Studio] Created in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Puzzle generated",
      data: newPuzzle,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Puzzle Studio] Failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Puzzle generation failed",
    });
  }
};

// ================================================================
// 📋 LIST
// GET /api/puzzle-studio
// ================================================================
exports.listPuzzles = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const lib = await Mystery.findOne({
      userId,
      title: "__Puzzle Library__",
    }).lean();

    return res.json({
      success: true,
      count: lib?.puzzles?.length || 0,
      data: lib?.puzzles || [],
    });
  } catch (err) {
    console.error("❌ List puzzles failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load",
    });
  }
};

// ================================================================
// 🗑️ DELETE
// DELETE /api/puzzle-studio/:id
// ================================================================
exports.deletePuzzle = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const lib = await Mystery.findOne({
      userId,
      title: "__Puzzle Library__",
    });
    if (!lib) return res.status(404).json({ success: false, message: "Not found" });

    lib.puzzles = (lib.puzzles || []).filter((p) => p.id !== id);
    await lib.save();

    return res.json({ success: true, message: "Puzzle deleted" });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete",
    });
  }
};