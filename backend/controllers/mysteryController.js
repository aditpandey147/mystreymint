// backend/controllers/mysteryController.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { chat, image } = require("../services/aiService");
const Mystery = require("../models/Mystery");
const {
  renderPdf,
  buildBaseData,
  ensureDir,
  toRelativePath,
  EXPORTS_ROOT_ABS,
} = require("../services/pdfService");

// ================================================================
// 📁 UPLOAD PATHS
// ================================================================
const UPLOADS_ROOT = path.join(__dirname, "../uploads/mysteries");
const PUBLIC_PREFIX = "/uploads/mysteries";

// ================================================================
// 🧠 SYSTEM PROMPTS
// ================================================================
const BASE_RULES = `
You are a master mystery author and game designer for MysteryMint AI.
You create coherent, logically airtight printable mystery games.

RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no prose outside JSON.
2. Match the exact shape defined by the schema. Do not add or rename keys.
3. Every output must logically belong to the SAME mystery.
4. The culprit is chosen ONCE and never changes.
5. Player-facing content must NOT reveal the solution or the culprit.
6. Keep names, locations, and timestamps consistent across every stage.
`;

const BLUEPRINT_PROMPT = `${BASE_RULES}
TASK: Generate the HIDDEN MASTER BLUEPRINT for a mystery.

Schema:
{
  "title": "string",
  "genre": "string",
  "setting": "string",
  "concept": "1-2 sentence high-level idea",
  "victim": { "name": "", "age": 0, "role": "", "foundAt": "", "causeOfDeath": "" },
  "culprit": { "name": "", "role": "" },
  "motive": "string",
  "method": "string",
  "actualTimeline": [
    { "id": "T1", "time": "HH:MM", "location": "", "characters": [], "event": "" }
  ],
  "suspects": [
    { "name": "", "role": "", "secret": "", "alibi": "", "motive": "", "isCulprit": false }
  ],
  "relationships": [
    { "from": "", "to": "", "type": "", "description": "" }
  ],
  "hiddenSecrets": ["..."],
  "essentialEvidence": ["..."],
  "misleadingEvidence": ["..."],
  "plotTwists": ["..."],
  "finalSolution": "Complete explanation that unifies every clue."
}
Return ONLY the JSON object.`;

const STORY_PROMPT = `${BASE_RULES}
TASK: Write the PLAYER-FACING STORY using the master blueprint.
The story must NOT reveal the culprit or the solution.

Word count requirements (STRICT):
- introduction:      200-250 words (2-3 paragraphs)
- background:        200-250 words (2-3 paragraphs)
- settingDescription: 180-220 words (2 paragraphs)
- mainIncident:      200-250 words (2-3 paragraphs)
- crimeDiscovery:    180-220 words (2 paragraphs)
- investigationOpening: 180-220 words (2 paragraphs)
- suspensefulDevelopments: 5-6 items, each 35-50 words
- finalChallenge:    150-200 words (2 paragraphs)

Total target: 1400-1800 words across all fields.

Formatting rules:
- Separate every paragraph with a BLANK LINE (\\n\\n inside the string).
- Use present-tense literary prose — atmospheric and immersive.
- Include sensory details (sights, sounds, smells, textures).
- Include short dialogue snippets where characters speak.
- Show, don't just tell — describe rooms, faces, actions.
- Every field must have real content, not one-liners.
- Build rising tension from introduction through to finalChallenge.

Schema:
{
  "introduction": "string (200-250 words, paragraphs separated by \\n\\n)",
  "background": "string (200-250 words, paragraphs separated by \\n\\n)",
  "settingDescription": "string (180-220 words, paragraphs separated by \\n\\n)",
  "mainIncident": "string (200-250 words, paragraphs separated by \\n\\n)",
  "crimeDiscovery": "string (180-220 words, paragraphs separated by \\n\\n)",
  "investigationOpening": "string (180-220 words, paragraphs separated by \\n\\n)",
  "keyEvents": [ { "id": "S1", "title": "", "description": "" } ],
  "suspensefulDevelopments": ["5-6 items, each 35-50 words"],
  "finalChallenge": "string (150-200 words, paragraphs separated by \\n\\n)"
}
Return ONLY the JSON object.`;

const CHARACTERS_PROMPT = `${BASE_RULES}
TASK: Generate the SUSPECTS using the blueprint.
Return EXACTLY the number of characters based on the playerCount field:
- "2-4" → 4 characters
- "4-8" → 6 characters
- "8-12" → 8 characters
- otherwise → 5 characters
DO NOT return more than the specified count. Keep each character's
personality and background to 2 sentences max.
Player-facing fields must NOT expose the culprit.
Portrait prompt must be a short (<=25 words) cinematic description.

Schema:
{
  "characters": [
    {
      "id": "C1",
      "name": "",
      "age": 0,
      "role": "",
      "occupation": "",
      "personality": "",
      "background": "",
      "motive": "",
      "alibi": "",
      "relationships": [
        { "with": "", "type": "", "description": "" }
      ],
      "isCulprit": false,
      "publicInformation": { "appearance": "", "mannerisms": "", "knownFacts": [] },
      "privateInformation": { "secret": "", "suspiciousBehavior": "", "alibiTruth": "" },
      "portraitPrompt": ""
    }
  ]
}
Return ONLY the JSON object.`;

const CLUES_PROMPT = `${BASE_RULES}
TASK: Generate CLUES tied directly to the blueprint.
Include essential clues AND misleading (red herring) clues.
Every clue must support a specific deduction.

Schema:
{
  "clues": [
    {
      "id": "CL1",
      "title": "",
      "description": "",
      "type": "Physical Evidence|Testimony|Document|Observation|Forensic",
      "importance": "Critical|Major|Minor",
      "discoveryLocation": "",
      "relatedCharacters": [],
      "relatedEvents": [],
      "supportsDeduction": "",
      "isRedHerring": false,
      "hint": ""
    }
  ]
}
Return ONLY the JSON object.`;

const EVIDENCE_PROMPT = `${BASE_RULES}
TASK: Generate fictional EVIDENCE DOCUMENTS.
Each document must be logically connected and readable in a PDF.

Schema:
{
  "evidence": [
    {
      "id": "E1",
      "title": "",
      "type": "Witness Statement|Letter|Diary Entry|Security Report|Receipt|Record|Newspaper Article|Investigation Report|Photographic Evidence",
      "relatedCharacters": [],
      "relatedEvents": [],
      "body": "Full readable text content for the document."
    }
  ]
}
Return ONLY the JSON object.`;

const PUZZLES_PROMPT = `${BASE_RULES}
TASK: Generate PUZZLES for the game. Include at least:
- 1 Cipher, 1 Logic puzzle, 1 Riddle, 1 Pattern/Timeline challenge.
All puzzles must be solvable using only player-facing information.

Keep everything SHORT:
- question: max 40 words
- answer: max 15 words
- explanation: max 40 words
- hints: exactly 3 hints, each max 15 words
- puzzleData: SMALL. Only include the minimum needed (e.g. ciphertext + shift,
  or a short ordered list of steps). No nested narratives. No full timelines.
  No character biographies inside puzzleData.

Schema:
{
  "puzzles": [
    {
      "id": "P1",
      "title": "max 6 words",
      "type": "Cipher|Riddle|Logic|Deduction|Pattern|Timeline|Relationship",
      "difficulty": "Easy|Medium|Hard",
      "question": "max 40 words",
      "puzzleData": {},
      "answer": "max 15 words",
      "explanation": "max 40 words",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "relatedClueIds": []
    }
  ]
}
Return ONLY the JSON object.`;

const PLAYER_TIMELINE_PROMPT = `${BASE_RULES}
TASK: Build the PLAYER-VISIBLE INVESTIGATION TIMELINE.
Derived from the blueprint's actualTimeline but EXPOSED to players.
Never reveal the culprit directly.

Schema:
{
  "events": [
    { "id": "PT1", "time": "HH:MM", "location": "", "characters": [], "description": "", "visibleToPlayers": true }
  ]
}
Return ONLY the JSON object.`;

const SOLUTION_PROMPT = `${BASE_RULES}
TASK: Generate the GAME-MASTER-ONLY SOLUTION GUIDE.

Schema:
{
  "culprit": "",
  "motive": "",
  "method": "",
  "fullTimelineNarrative": "string",
  "clueExplanations": [ { "clueId": "", "meaning": "" } ],
  "redHerringExplanations": [ { "clueId": "", "whyMisleading": "" } ],
  "puzzleAnswers": [ { "puzzleId": "", "answer": "", "explanation": "" } ],
  "finalDeductionWalkthrough": "string",
  "caseConclusion": "string"
}
Return ONLY the JSON object.`;

const VALIDATOR_PROMPT = `${BASE_RULES}
TASK: Validate the mystery. Report issues only.

Rules:
- Only report ACTUAL inconsistencies between blueprint, clues, puzzles, and solution.
- Each "message" MUST be under 120 characters. No long explanations.
- Do NOT flag minor wording differences — only factual/logical contradictions.
- If you find fewer than 3 real issues, return "valid": true and an empty issues array.
- Maximum 3 issues in the array. Anything more is a warning, not a fatal error.

Schema:
{
  "valid": true,
  "issues": [
    { "severity": "error|warning", "area": "max 20 chars", "message": "max 120 chars" }
  ],
  "notes": "max 200 chars"
}
Return ONLY the JSON object.`;

// ================================================================
// 🛟 SAFE JSON PARSE
// ================================================================
function safeJsonParse(raw, label = "AI") {
  if (!raw) throw new Error(`${label} returned empty response`);

  let text = String(raw).trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn(`⚠️ ${label} JSON parse failed — attempting recovery...`);

    const repaired = tryRepairJson(text);
    if (repaired) {
      try {
        return JSON.parse(repaired);
      } catch (e) {
        // fall through
      }
    }

    console.error(
      `❌ Failed to parse ${label} JSON. Raw (first 500):`,
      text.slice(0, 500),
    );
    throw new Error(`${label} returned invalid JSON`);
  }
}

function tryRepairJson(text) {
  let s = text.trim();

  const lastComma = s.lastIndexOf(",");
  const lastClose = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));

  if (lastComma < lastClose) return null;

  s = s.slice(0, lastComma);

  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (const ch of s) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") openBraces++;
    else if (ch === "}") openBraces--;
    else if (ch === "[") openBrackets++;
    else if (ch === "]") openBrackets--;
  }

  if (inString) s += '"';

  s += "]".repeat(Math.max(0, openBrackets));
  s += "}".repeat(Math.max(0, openBraces));

  return s;
}

// ================================================================
// 🔁 RETRY WRAPPER
// ================================================================
async function callJson({
  systemPrompt,
  userMessage,
  label,
  maxTokens = 4000,
}) {
  const MAX_ATTEMPTS = 3;
  let lastErr;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await chat({
        systemPrompt,
        userMessage,
        temperature: 0.7,
        maxTokens,
      });
      return safeJsonParse(raw, label);
    } catch (err) {
      lastErr = err;
      console.warn(
        `🔁 ${label} attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`,
      );
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt - 1)));
    }
  }

  throw lastErr || new Error(`${label} failed after ${MAX_ATTEMPTS} attempts`);
}

// ================================================================
// 🎨 IMAGE STYLE SUFFIX
// ================================================================
const IMAGE_STYLE_SUFFIX =
  ", cinematic mystery game illustration, dramatic lighting, premium quality, no text, no watermark";

// ================================================================
// 🧹 NORMALIZE CHARACTERS
// ================================================================
function normalizeCharacters(characters) {
  if (!Array.isArray(characters)) return [];

  return characters.map((c) => {
    const safe = c && typeof c === "object" ? c : {};

    const relationships = Array.isArray(safe.relationships)
      ? safe.relationships.filter(Boolean).map((r) => {
          if (typeof r === "string") {
            return { with: "", to: "", from: "", type: "", description: r };
          }
          if (typeof r !== "object") {
            return {
              with: "",
              to: "",
              from: "",
              type: "",
              description: String(r || ""),
            };
          }
          return {
            with: r.with || "",
            to: r.to || "",
            from: r.from || "",
            type: r.type || "",
            description: r.description || r.relation || "",
          };
        })
      : [];

    const pub = safe.publicInformation || {};
    const priv = safe.privateInformation || {};

    return {
      id: String(safe.id || ""),
      name: String(safe.name || "Unknown"),
      age: Number(safe.age) || 0,
      role: String(safe.role || ""),
      occupation: String(safe.occupation || ""),
      personality: String(safe.personality || ""),
      background: String(safe.background || ""),
      motive: String(safe.motive || ""),
      alibi: String(safe.alibi || ""),
      relationships,
      isCulprit: safe.isCulprit === true,
      publicInformation: {
        appearance: String(pub.appearance || ""),
        mannerisms: String(pub.mannerisms || ""),
        knownFacts: Array.isArray(pub.knownFacts)
          ? pub.knownFacts.filter(Boolean).map(String)
          : [],
      },
      privateInformation: {
        secret: String(priv.secret || ""),
        suspiciousBehavior: String(priv.suspiciousBehavior || ""),
        alibiTruth: String(priv.alibiTruth || ""),
      },
      portraitPrompt: String(safe.portraitPrompt || ""),
      portraitUrl: safe.portraitUrl || null,
    };
  });
}

// ================================================================
// 🖼️ DOWNLOAD IMAGE → STORE RELATIVE PATH
// ================================================================
async function downloadAndStore(remoteUrl, mysteryId, filename) {
  if (!remoteUrl) return null;

  try {
    const dir = path.join(UPLOADS_ROOT, String(mysteryId));
    await fsp.mkdir(dir, { recursive: true });

    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    await fsp.writeFile(path.join(dir, filename), buf);

    return `${PUBLIC_PREFIX}/${mysteryId}/${filename}`;
  } catch (err) {
    console.error(`❌ Image store failed (${filename}):`, err.message);
    return null;
  }
}

// ================================================================
// 🎯 GENERATE MYSTERY
// POST /api/mysteries/generate
// ================================================================
exports.generateMystery = async (req, res) => {
  try {
    const {
      title,
      genre,
      setting,
      difficulty = "Medium",
      playerCount = "4-8",
      duration = 60,
      targetAudience = "Adults",
      storyIdea = "",
      includeImages = true,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }
    if (!genre) {
      return res
        .status(400)
        .json({ success: false, message: "Genre is required" });
    }
    if (!setting) {
      return res
        .status(400)
        .json({ success: false, message: "Setting is required" });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const input = {
      title: title.trim(),
      genre,
      setting,
      difficulty,
      playerCount,
      duration,
      targetAudience,
      storyIdea: storyIdea.trim(),
    };

    const mystery = await Mystery.create({
      userId,
      title: input.title,
      genre: input.genre,
      setting: input.setting,
      difficulty: input.difficulty,
      playerCount: input.playerCount,
      duration: input.duration,
      targetAudience: input.targetAudience,
      storyIdea: input.storyIdea,
      generationStatus: "generating",
      generationProgress: 5,
      currentStage: "Validating input",
    });

    console.log(`🎬 [Mystery] Queued: ${mystery._id} — ${input.title}`);

    res.json({
      success: true,
      message: "Generation started",
      mysteryId: mystery._id,
      status: "generating",
    });

    runMysteryPipeline(mystery._id, input, includeImages).catch((err) => {
      console.error(`❌ [Mystery] Pipeline failed for ${mystery._id}:`, err);
      Mystery.updateOne(
        { _id: mystery._id },
        {
          generationStatus: "failed",
          generationError: err.message || "Generation failed",
          currentStage: "Failed",
        },
      ).catch(() => {});
    });
  } catch (error) {
    console.error("❌ [Mystery] Enqueue failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start generation",
    });
  }
};

// ================================================================
// 🏗️ BACKGROUND PIPELINE
// ================================================================
async function runMysteryPipeline(mysteryId, input, includeImages) {
  const startedAt = Date.now();

  const updateProgress = async (progress, stage) => {
    try {
      await Mystery.updateOne(
        { _id: mysteryId },
        { generationProgress: progress, currentStage: stage },
      );
    } catch (err) {
      console.warn("⚠️ Progress update failed:", err.message);
    }
  };

  try {
    console.log("🧠 Stage 1/9 — Blueprint");
    await updateProgress(12, "Generating master blueprint");
    const blueprint = await callJson({
      systemPrompt: BLUEPRINT_PROMPT,
      userMessage: `Mystery request:\n${JSON.stringify(input, null, 2)}`,
      label: "Master Blueprint",
      maxTokens: 4000,
    });

    console.log("📖 Stage 2/9 — Story");
    await updateProgress(25, "Writing the mystery story");
    const story = await callJson({
      systemPrompt: STORY_PROMPT,
      userMessage: `Request:\n${JSON.stringify(
        input,
      )}\n\nBlueprint:\n${JSON.stringify(blueprint)}`,
      label: "Story",
      maxTokens: 6000,
    });

    console.log("👥 Stage 3/9 — Characters");
    await updateProgress(35, "Creating characters");
    const charactersResult = await callJson({
      systemPrompt: CHARACTERS_PROMPT,
      userMessage: `Request:\n${JSON.stringify(
        input,
      )}\n\nBlueprint:\n${JSON.stringify(
        blueprint,
      )}\n\nStory summary:\n${story.introduction}`,
      label: "Characters",
      maxTokens: 8000,
    });
    const characters = normalizeCharacters(charactersResult.characters || []);

    console.log("🔍 Stage 4/9 — Clues");
    await updateProgress(45, "Placing clues");
    const cluesResult = await callJson({
      systemPrompt: CLUES_PROMPT,
      userMessage: `Blueprint:\n${JSON.stringify(
        blueprint,
      )}\n\nCharacters:\n${JSON.stringify(characters)}`,
      label: "Clues",
      maxTokens: 3500,
    });
    const clues = cluesResult.clues || [];

    console.log("📜 Stage 5/9 — Evidence");
    await updateProgress(55, "Crafting evidence documents");
    const evidenceResult = await callJson({
      systemPrompt: EVIDENCE_PROMPT,
      userMessage: `Blueprint:\n${JSON.stringify(
        blueprint,
      )}\n\nClues:\n${JSON.stringify(clues)}`,
      label: "Evidence",
      maxTokens: 4000,
    });
    const evidence = evidenceResult.evidence || [];

    console.log("🧩 Stage 6/9 — Puzzles");
    await updateProgress(65, "Building puzzles");
    const puzzlesResult = await callJson({
      systemPrompt: PUZZLES_PROMPT,
      userMessage: `Blueprint:\n${JSON.stringify(
        blueprint,
      )}\n\nClues:\n${JSON.stringify(clues)}`,
      label: "Puzzles",
      maxTokens: 6900,
    });
    const puzzles = puzzlesResult.puzzles || [];

    console.log("🕰️ Stage 7/9 — Timeline + Solution");
    await updateProgress(72, "Constructing timelines");

    const playerTimelineResult = await callJson({
      systemPrompt: PLAYER_TIMELINE_PROMPT,
      userMessage: `Blueprint:\n${JSON.stringify(blueprint)}`,
      label: "Player Timeline",
      maxTokens: 2500,
    });
    const playerTimeline = playerTimelineResult.events || [];

    const solution = await callJson({
      systemPrompt: SOLUTION_PROMPT,
      userMessage: `Blueprint:\n${JSON.stringify(
        blueprint,
      )}\n\nClues:\n${JSON.stringify(clues)}\n\nPuzzles:\n${JSON.stringify(
        puzzles,
      )}`,
      label: "Solution",
      maxTokens: 3500,
    });

    console.log("✅ Stage 8/9 — Validation");
    await updateProgress(80, "Checking mystery logic");
    const validationReport = await callJson({
      systemPrompt: VALIDATOR_PROMPT,
      userMessage: JSON.stringify({ blueprint, clues, puzzles, solution }),
      label: "Validation",
      maxTokens: 4000,
    });

    let coverImage = null;
    let characterPortraits = [];
    let sceneImages = [];

    if (includeImages) {
      console.log("🎨 Stage 9/9 — Images");
      await updateProgress(85, "Rendering cover image");

      try {
        const remoteCover = await image({
          prompt: `Mystery game cover for "${blueprint.title}" set in a ${blueprint.setting}. Scene: ${blueprint.concept}${IMAGE_STYLE_SUFFIX}`,
          aspectRatio: "portrait",
        });
        coverImage = await downloadAndStore(
          remoteCover,
          mysteryId,
          "cover.png",
        );
      } catch (err) {
        console.error("❌ Cover image failed:", err.message);
      }

      for (let i = 0; i < characters.length; i++) {
        const c = characters[i];
        await updateProgress(
          85 + Math.round((i / Math.max(characters.length, 1)) * 8),
          `Rendering portraits (${i + 1}/${characters.length})`,
        );
        try {
          const remote = await image({
            prompt: `${
              c.portraitPrompt ||
              `Portrait of ${c.name}, a ${c.age}-year-old ${c.occupation}`
            }${IMAGE_STYLE_SUFFIX}`,
            aspectRatio: "portrait",
          });
          const localUrl = await downloadAndStore(
            remote,
            mysteryId,
            `character-${c.id}.png`,
          );
          characterPortraits.push({
            characterId: c.id,
            name: c.name,
            url: localUrl,
          });
        } catch (err) {
          console.error(`❌ Portrait failed for ${c.name}:`, err.message);
          characterPortraits.push({
            characterId: c.id,
            name: c.name,
            url: null,
          });
        }
      }

      const locations = (blueprint.actualTimeline || [])
        .map((t) => t.location)
        .filter(Boolean)
        .slice(0, 3);

      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        await updateProgress(
          93 + Math.round((i / Math.max(locations.length, 1)) * 4),
          `Rendering scene (${i + 1}/${locations.length})`,
        );
        try {
          const remote = await image({
            prompt: `Cinematic crime scene illustration of "${loc}" for a ${blueprint.genre} mystery${IMAGE_STYLE_SUFFIX}`,
            aspectRatio: "wide",
          });
          const localUrl = await downloadAndStore(
            remote,
            mysteryId,
            `scene-${i}.png`,
          );
          sceneImages.push({ location: loc, url: localUrl });
        } catch (err) {
          console.error(`❌ Scene image failed for ${loc}:`, err.message);
          sceneImages.push({ location: loc, url: null });
        }
      }
    }

    const vr = validationReport || {};
    const issues = Array.isArray(vr.issues) ? vr.issues : [];
    const hasErrors = issues.some((i) => i?.severity === "error");
    const explicitlyInvalid = vr.valid === false;

    const finalStatus =
      hasErrors || (explicitlyInvalid && issues.length > 0)
        ? "needs_review"
        : "completed";

    await Mystery.updateOne(
      { _id: mysteryId },
      {
        generationStatus: finalStatus,
        generationProgress: 100,
        currentStage: "Completed",
        blueprint,
        story,
        characters,
        clues,
        evidence,
        puzzles,
        playerTimeline,
        actualTimeline: blueprint.actualTimeline || [],
        solution,
        validationReport,
        images: {
          cover: coverImage,
          characters: characterPortraits,
          scenes: sceneImages,
        },
      },
    );

    const elapsedMs = Date.now() - startedAt;
    console.log(
      `🎉 [Mystery] Completed in ${(elapsedMs / 1000).toFixed(1)}s (status: ${finalStatus})`,
    );
  } catch (err) {
    console.error(`❌ [Mystery] Pipeline error:`, err);
    await Mystery.updateOne(
      { _id: mysteryId },
      {
        generationStatus: "failed",
        generationError: err.message || "Generation failed",
        currentStage: "Failed",
      },
    ).catch(() => {});
    throw err;
  }
}

// ================================================================
// 📋 LIST USER'S MYSTERIES
// GET /api/mysteries
// ================================================================
exports.listMysteries = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const mysteries = await Mystery.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const cleaned = mysteries.map((m) => ({
      _id: m._id,
      title: m.title,
      genre: m.genre,
      setting: m.setting,
      difficulty: m.difficulty,
      playerCount: m.playerCount,
      duration: m.duration,
      targetAudience: m.targetAudience,
      generationStatus: m.generationStatus || "pending",
      generationProgress: m.generationProgress || 0,
      currentStage: m.currentStage || "",
      images: { cover: m.images?.cover || null },
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return res.json({
      success: true,
      count: cleaned.length,
      data: cleaned,
    });
  } catch (error) {
    console.error("❌ List mysteries failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load mysteries",
    });
  }
};

// ================================================================
// 🔍 GET SINGLE MYSTERY
// GET /api/mysteries/:id
// ================================================================
exports.getMystery = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const mystery = await Mystery.findOne({
      _id: req.params.id,
      userId,
    });

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found",
      });
    }

    return res.json({
      success: true,
      data: mystery.toPlayerJSON ? mystery.toPlayerJSON() : mystery.toObject(),
    });
  } catch (error) {
    console.error("❌ Get mystery failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load mystery",
    });
  }
};

// ================================================================
// 🚦 GET STATUS
// GET /api/mysteries/:id/status
// ================================================================
exports.getMysteryStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const mystery = await Mystery.findOne(
      { _id: req.params.id, userId },
      "generationStatus generationProgress currentStage generationError",
    ).lean();

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found",
      });
    }

    return res.json({
      success: true,
      status: mystery.generationStatus,
      progress: mystery.generationProgress || 0,
      currentStage: mystery.currentStage || "",
      message:
        mystery.generationError ||
        mystery.currentStage ||
        (mystery.generationStatus === "completed"
          ? "Completed"
          : "Generating..."),
    });
  } catch (error) {
    console.error("❌ Status failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch status",
    });
  }
};

// ================================================================
// 🗑️ DELETE MYSTERY
// DELETE /api/mysteries/:id
// ================================================================
exports.deleteMystery = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const mystery = await Mystery.findOne({
      _id: req.params.id,
      userId,
    });

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found",
      });
    }

    try {
      const dir = path.join(UPLOADS_ROOT, String(mystery._id));
      await fsp.rm(dir, { recursive: true, force: true });
    } catch (err) {
      console.warn("⚠️ Failed to clean image files:", err.message);
    }

    try {
      const pdfDir = path.join(EXPORTS_ROOT_ABS, String(mystery._id));
      await fsp.rm(pdfDir, { recursive: true, force: true });
    } catch (err) {
      console.warn("⚠️ Failed to clean PDF files:", err.message);
    }

    await Mystery.deleteOne({ _id: mystery._id, userId });

    return res.json({ success: true, message: "Mystery deleted" });
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete",
    });
  }
};

// ================================================================
// 🩺 TEST — quick blueprint sanity check
// POST /api/mysteries/test-blueprint
// ================================================================
exports.testBlueprint = async (req, res) => {
  try {
    const input = {
      title: "Test Mystery",
      genre: "Murder Mystery",
      setting: "Luxury Cruise Ship",
      difficulty: "Medium",
      playerCount: "4-8",
      duration: 60,
      targetAudience: "Adults",
      storyIdea: "A billionaire is murdered aboard a luxury cruise.",
    };

    const blueprint = await callJson({
      systemPrompt: BLUEPRINT_PROMPT,
      userMessage: `Mystery request:\n${JSON.stringify(input, null, 2)}`,
      label: "Master Blueprint",
      maxTokens: 4000,
    });

    return res.json({ success: true, blueprint });
  } catch (error) {
    console.error("❌ Blueprint test failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 📄 PDF KIND CONFIG — one entry per section
// `base` comes from pdfService.buildBaseData(), so every image
// (cover, scenes, portraits) is already embedded as a data URL.
// ================================================================
const PDF_KINDS = {
  story: {
    fileName: "Mystery_Story.pdf",
    templateName: "story",
    themeKey: "story",
    buildData: (m, base) => ({ ...base, story: m.story || {} }),
  },
  suspects: {
    fileName: "Suspect_Cards.pdf",
    templateName: "suspect-cards",
    themeKey: "suspects",
    buildData: (m, base) => {
      const characters = (m.characters || []).map((c) => {
        const portrait = (base.characterPortraits || []).find(
          (img) => img.characterId === c.id,
        );
        return { ...c, portraitUrl: portrait?.url || null };
      });
      return { ...base, characters };
    },
  },
  clues: {
    fileName: "Clues_and_Evidence.pdf",
    templateName: "clues",
    themeKey: "clues",
    buildData: (m, base) => ({
      ...base,
      clues: m.clues || [],
      evidence: m.evidence || [],
    }),
  },
  puzzles: {
    fileName: "Puzzle_Sheets.pdf",
    templateName: "puzzles",
    themeKey: "puzzles",
    buildData: (m, base) => ({ ...base, puzzles: m.puzzles || [] }),
  },
  solution: {
    fileName: "Solution_Guide.pdf",
    templateName: "solution",
    themeKey: "solution",
    buildData: (m, base) => ({
      ...base,
      solution: m.solution || {},
      puzzles: m.puzzles || [],
    }),
  },
  instructions: {
    fileName: "Player_Instructions.pdf",
    templateName: "instructions",
    themeKey: "instructions",
    buildData: (m, base) => ({
      ...base,
      playerTimeline: m.playerTimeline || [],
    }),
  },
};

// ================================================================
// 🖨️ BUILD ONE PDF
// ================================================================
async function buildSinglePdf(mysteryDoc, kind) {
  const cfg = PDF_KINDS[kind];
  if (!cfg) throw new Error(`Unknown PDF kind: ${kind}`);

  const mystery = mysteryDoc.toObject ? mysteryDoc.toObject() : mysteryDoc;
  const mysteryId = String(mystery._id);

  const pdfDir = path.join(EXPORTS_ROOT_ABS, mysteryId, "pdf");
  await ensureDir(pdfDir);

  const outFile = path.join(pdfDir, cfg.fileName);

  // ✅ Service version: async, embeds cover / scenes / portraits as base64
  const base = await buildBaseData(mystery);
  const data = cfg.buildData(mystery, base);

  await renderPdf({
    templateName: cfg.templateName,
    data,
    outFile,
    themeKey: cfg.themeKey,
  });

  const stat = await fsp.stat(outFile);

  return {
    kind,
    fileName: cfg.fileName,
    absolutePath: outFile,
    relativePath: toRelativePath(outFile),
    fileSize: stat.size,
    mimeType: "application/pdf",
  };
}

// ================================================================
// 👁️ VIEW PDF — inline in browser tab
// GET /api/mysteries/:id/pdf/:kind
// ================================================================
exports.viewMysteryPdf = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id, kind } = req.params;

    if (!PDF_KINDS[kind]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid PDF kind" });
    }

    const mystery = await Mystery.findOne({ _id: id, userId });
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    console.log(`🖨️  [View PDF] Building ${kind} for mystery ${id}…`);
    const result = await buildSinglePdf(mystery, kind);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${result.fileName}"`,
    );
    res.setHeader("Content-Length", result.fileSize);
    res.setHeader("Cache-Control", "no-store");

    const stream = fs.createReadStream(result.absolutePath);
    stream.pipe(res);
  } catch (err) {
    console.error("❌ View PDF failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to build PDF",
      });
    }
  }
};

// ================================================================
// ⬇️ DOWNLOAD PDF — as attachment
// GET /api/mysteries/:id/pdf/:kind/download
// ================================================================
exports.downloadMysteryPdf = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id, kind } = req.params;

    if (!PDF_KINDS[kind]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid PDF kind" });
    }

    const mystery = await Mystery.findOne({ _id: id, userId });
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    console.log(`🖨️  [Download PDF] Building ${kind} for mystery ${id}…`);
    const result = await buildSinglePdf(mystery, kind);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader("Content-Length", result.fileSize);

    const stream = fs.createReadStream(result.absolutePath);
    stream.pipe(res);
  } catch (err) {
    console.error("❌ Download PDF failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to build PDF",
      });
    }
  }
};

// ================================================================
// 📊 PDF STATUS — which PDFs already exist on disk
// GET /api/mysteries/:id/pdf/status
// ================================================================
exports.getPdfStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const mystery = await Mystery.findOne({ _id: id, userId }).lean();
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    const pdfDir = path.join(EXPORTS_ROOT_ABS, String(id), "pdf");
    const status = {};

    for (const [kind, cfg] of Object.entries(PDF_KINDS)) {
      const full = path.join(pdfDir, cfg.fileName);
      try {
        const st = await fsp.stat(full);
        status[kind] = {
          exists: true,
          fileName: cfg.fileName,
          fileSize: st.size,
          downloadUrl: `/mysteries/${id}/pdf/${kind}/download`,
          viewUrl: `/mysteries/${id}/pdf/${kind}?inline=1`,
        };
      } catch {
        status[kind] = {
          exists: false,
          fileName: cfg.fileName,
          downloadUrl: `/mysteries/${id}/pdf/${kind}/download`,
          viewUrl: `/mysteries/${id}/pdf/${kind}?inline=1`,
        };
      }
    }

    res.json({ success: true, data: status });
  } catch (err) {
    console.error("❌ PDF status failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
