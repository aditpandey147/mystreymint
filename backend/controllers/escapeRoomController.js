// backend/controllers/escapeRoomController.js
const fsp = require("fs/promises");
const path = require("path");
const { chat, image } = require("../services/aiService");
const Mystery = require("../models/Mystery");

const UPLOADS_ROOT = path.join(__dirname, "../uploads/escape");
const PUBLIC_PREFIX = "/uploads/escape";

// ================================================================
// 🧠 PROMPTS
// ================================================================
const BASE_RULES = `
You are a master escape-room designer for MysteryMint AI.
Return ONLY valid JSON. No markdown, no code fences, no prose.
`;

const ESCAPE_ROOM_PROMPT = `${BASE_RULES}
TASK: Design ONE complete escape room. Everything must be logically
connected — each puzzle unlocks the next, and the final puzzle opens
the exit.

Keep everything TIGHT:
- roomDescription: 3 sentences, max 60 words
- puzzles: 4-6 puzzles, ordered by progression
- hints: exactly 3 per puzzle, each max 15 words
- solutionWalkthrough: 120-180 words
- imagePrompts: cinematic, no text, no watermark, max 20 words each

Schema:
{
  "title": "max 6 words",
  "theme": "string (e.g. Haunted Library, Cyber Heist)",
  "era": "string",
  "setting": "string",
  "difficulty": "Easy|Medium|Hard|Expert",
  "playerCount": "2-4|4-6|6-8|8+",
  "duration": 60,
  "roomDescription": "3 sentences, max 60 words",
  "atmosphere": "1 sentence, max 25 words",
  "rooms": [
    {
      "id": "R1",
      "name": "max 5 words",
      "description": "1 sentence, max 30 words",
      "imagePrompt": "max 20 words — cinematic room visual"
    }
  ],
  "puzzles": [
    {
      "id": "P1",
      "order": 1,
      "title": "max 6 words",
      "type": "Cipher|Logic|Riddle|Pattern|Physical|Combination|Sequence|Hidden Object",
      "roomId": "R1",
      "setup": "max 40 words — how the player encounters it",
      "puzzleContent": "the actual puzzle text or data to solve",
      "answer": "max 15 words",
      "solution": "1-2 sentences explaining how it's solved",
      "unlocks": "what this puzzle unlocks (a key, a code, the next clue)",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "imagePrompt": "max 20 words — cinematic puzzle visual"
    }
  ],
  "finalLock": {
    "description": "1 sentence describing the exit lock",
    "combination": "the exact code/action needed to escape",
    "puzzleIds": ["P1", "P2", "P3", "P4"]
  },
  "solutionWalkthrough": "step-by-step narrative, 120-180 words",
  "gameMasterNotes": "1-2 sentences on setup and pacing"
}
Return ONLY the JSON object.`;

const IMAGE_STYLE_SUFFIX =
  ", cinematic escape room illustration, dramatic lighting, premium quality, no text, no watermark";

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
    console.error(`❌ Failed to parse ${label} JSON:`, text.slice(0, 600));
    throw new Error(`${label} returned invalid JSON`);
  }
}

async function callJson({ systemPrompt, userMessage, label, maxTokens = 6000 }) {
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
// 🔧 LIBRARY DOC
// ================================================================
async function getOrCreateLibrary(userId) {
  let lib = await Mystery.findOne({ userId, title: "__Escape Library__" });
  if (!lib) {
    lib = await Mystery.create({
      userId,
      title: "__Escape Library__",
      genre: "Escape Room Library",
      setting: "Library",
      difficulty: "Medium",
      playerCount: "0",
      duration: 0,
      targetAudience: "Internal",
      generationStatus: "completed",
      generationProgress: 100,
      currentStage: "Completed",
      rooms: [],
    });
  }
  return lib;
}

// ================================================================
// 🎯 GENERATE ESCAPE ROOM
// POST /api/escape-rooms/generate
// ================================================================
exports.generateEscapeRoom = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user?.id || req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const {
      theme = "Haunted Library",
      era = "1920s",
      difficulty = "Medium",
      playerCount = "4-6",
      duration = 60,
      puzzleCount = 5,
      prompt = "",
      includeImages = true,
    } = req.body || {};

    console.log(`🚪 [Escape Studio] Generating for ${userId}…`);

    const escapeData = await callJson({
      systemPrompt: ESCAPE_ROOM_PROMPT,
      userMessage: `Design an escape room with these parameters:\n${JSON.stringify(
        {
          theme,
          era,
          difficulty,
          playerCount,
          duration,
          puzzleCount,
          prompt,
        },
        null,
        2
      )}`,
      label: "Escape Room",
      maxTokens: 8000,
    });

    // ---- Generate images ----
    const roomImages = [];
    const puzzleImages = [];

    if (includeImages) {
      // Room visuals
      const rooms = Array.isArray(escapeData.rooms) ? escapeData.rooms : [];
      for (let i = 0; i < rooms.length; i++) {
        const r = rooms[i];
        try {
          const remote = await image({
            prompt: `${r.imagePrompt || r.description}${IMAGE_STYLE_SUFFIX}`,
            aspectRatio: "landscape_16_9",
          });
          const localUrl = await downloadAndStore(
            remote,
            userId,
            `room-${i}-${Date.now()}.png`
          );
          roomImages.push({ roomId: r.id, url: localUrl });
        } catch (err) {
          console.error(`❌ Room image failed for ${r.name}:`, err.message);
          roomImages.push({ roomId: r.id, url: null });
        }
      }

      // Puzzle visuals
      const puzzles = Array.isArray(escapeData.puzzles) ? escapeData.puzzles : [];
      for (let i = 0; i < puzzles.length; i++) {
        const p = puzzles[i];
        try {
          const remote = await image({
            prompt: `${p.imagePrompt || p.setup}${IMAGE_STYLE_SUFFIX}`,
            aspectRatio: "landscape_16_9",
          });
          const localUrl = await downloadAndStore(
            remote,
            userId,
            `puzzle-${i}-${Date.now()}.png`
          );
          puzzleImages.push({ puzzleId: p.id, url: localUrl });
        } catch (err) {
          console.error(`❌ Puzzle image failed for ${p.title}:`, err.message);
          puzzleImages.push({ puzzleId: p.id, url: null });
        }
      }
    }

    const newEscapeRoom = {
      id: `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: escapeData.title || "Untitled Escape Room",
      theme: escapeData.theme || theme,
      era: escapeData.era || era,
      setting: escapeData.setting || "",
      difficulty: escapeData.difficulty || difficulty,
      playerCount: escapeData.playerCount || playerCount,
      duration: escapeData.duration || duration,
      roomDescription: escapeData.roomDescription || "",
      atmosphere: escapeData.atmosphere || "",
      rooms: escapeData.rooms || [],
      puzzles: escapeData.puzzles || [],
      finalLock: escapeData.finalLock || {},
      solutionWalkthrough: escapeData.solutionWalkthrough || "",
      gameMasterNotes: escapeData.gameMasterNotes || "",
      images: {
        rooms: roomImages,
        puzzles: puzzleImages,
      },
    };

    const library = await getOrCreateLibrary(userId);
    library.rooms.push(newEscapeRoom);
    await library.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(
      `🎉 [Escape Studio] Created in ${(elapsedMs / 1000).toFixed(1)}s`
    );

    return res.json({
      success: true,
      message: "Escape room generated",
      data: newEscapeRoom,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ [Escape Studio] Failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Generation failed",
    });
  }
};

// ================================================================
// 📋 LIST
// GET /api/escape-rooms
// ================================================================
exports.listEscapeRooms = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const lib = await Mystery.findOne({
      userId,
      title: "__Escape Library__",
    }).lean();

    return res.json({
      success: true,
      count: lib?.rooms?.length || 0,
      data: lib?.rooms || [],
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
// DELETE /api/escape-rooms/:id
// ================================================================
exports.deleteEscapeRoom = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const lib = await Mystery.findOne({
      userId,
      title: "__Escape Library__",
    });
    if (!lib) return res.status(404).json({ success: false, message: "Not found" });

    lib.rooms = (lib.rooms || []).filter((r) => r.id !== id);
    await lib.save();

    return res.json({ success: true, message: "Escape room deleted" });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete",
    });
  }
};