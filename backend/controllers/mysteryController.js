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

// 🎭 Demo mode helper
const {
  isDemoMode,
  buildDemoMystery,
  getDemoPdfPath,
} = require("../services/demoService");

// ================================================================
// 📁 UPLOAD PATHS
// ================================================================
const UPLOADS_ROOT = path.join(__dirname, "../uploads/mysteries");
const PUBLIC_PREFIX = "/uploads/mysteries";

// ================================================================
// 🧠 SYSTEM PROMPTS (unchanged — same as your file)
// ================================================================
const BASE_RULES = `...`; // unchanged
const BLUEPRINT_PROMPT = `...`;
const STORY_PROMPT = `...`;
const CHARACTERS_PROMPT = `...`;
const CLUES_PROMPT = `...`;
const EVIDENCE_PROMPT = `...`;
const PUZZLES_PROMPT = `...`;
const PLAYER_TIMELINE_PROMPT = `...`;
const SOLUTION_PROMPT = `...`;
const VALIDATOR_PROMPT = `...`;

// [All prompts, safeJsonParse, tryRepairJson, callJson,
//  IMAGE_STYLE_SUFFIX, normalizeCharacters, downloadAndStore
//  stay byte-for-byte identical to your current file]

// ================================================================
// 🎯 GENERATE MYSTERY
// ================================================================
exports.generateMystery = async (req, res) => {
  try {
    // 🎭 DEMO MODE — return demo mystery instantly
    if (isDemoMode()) {
      const demo = buildDemoMystery();
      console.log(`🎭 [Demo] Returning demo mystery (no AI calls)`);
      return res.json({
        success: true,
        message: "Demo mystery ready",
        mysteryId: demo._id,
        status: "completed",
        demo: true,
      });
    }

    // Normal mode (unchanged)
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
// 📋 LIST
// ================================================================
exports.listMysteries = async (req, res) => {
  try {
    // 🎭 DEMO MODE
    if (isDemoMode()) {
      const demo = buildDemoMystery();
      return res.json({
        success: true,
        count: 1,
        demo: true,
        data: [
          {
            _id: demo._id,
            title: demo.title,
            genre: demo.genre,
            setting: demo.setting,
            difficulty: demo.difficulty,
            playerCount: demo.playerCount,
            duration: demo.duration,
            targetAudience: demo.targetAudience,
            generationStatus: demo.generationStatus,
            generationProgress: 100,
            currentStage: "Completed",
            images: { cover: demo.images.cover },
            createdAt: demo.createdAt,
            updatedAt: demo.updatedAt,
          },
        ],
      });
    }

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
// 🔍 GET SINGLE
// ================================================================
exports.getMystery = async (req, res) => {
  try {
    // 🎭 DEMO MODE
    if (isDemoMode()) {
      return res.json({
        success: true,
        demo: true,
        data: buildDemoMystery(),
      });
    }

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
// ================================================================
exports.getMysteryStatus = async (req, res) => {
  try {
    // 🎭 DEMO MODE
    if (isDemoMode()) {
      return res.json({
        success: true,
        status: "completed",
        progress: 100,
        currentStage: "Completed",
        message: "Demo mystery ready",
        demo: true,
      });
    }

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
// 🗑️ DELETE
// ================================================================
exports.deleteMystery = async (req, res) => {
  try {
    // 🎭 DEMO MODE — pretend to delete
    if (isDemoMode()) {
      return res.json({
        success: true,
        message: "Demo mystery is read-only",
        demo: true,
      });
    }

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
// 🩺 TEST
// ================================================================
exports.testBlueprint = async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.json({
        success: true,
        message: "Demo mode — no live AI test available",
        demo: true,
      });
    }

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
// 📄 PDF KIND CONFIG
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
// 🖨️ BUILD SINGLE PDF
// ================================================================
async function buildSinglePdf(mysteryDoc, kind, { forceRebuild = false } = {}) {
  const cfg = PDF_KINDS[kind];
  if (!cfg) throw new Error(`Unknown PDF kind: ${kind}`);

  const mystery = mysteryDoc.toObject ? mysteryDoc.toObject() : mysteryDoc;
  const mysteryId = String(mystery._id);

  const pdfDir = path.join(EXPORTS_ROOT_ABS, mysteryId, "pdf");
  await ensureDir(pdfDir);

  const outFile = path.join(pdfDir, cfg.fileName);

  if (!forceRebuild) {
    try {
      const existing = await fsp.stat(outFile);
      if (existing.size > 1000) {
        console.log(
          `♻️  [${kind}] Cached PDF found — ${(existing.size / 1024).toFixed(0)} KB`,
        );
        return {
          kind,
          fileName: cfg.fileName,
          absolutePath: outFile,
          relativePath: toRelativePath(outFile),
          fileSize: existing.size,
          mimeType: "application/pdf",
          cached: true,
        };
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(`⚠️ Cache check failed for ${kind}:`, err.message);
      }
    }
  }

  console.log(`🖨️  [${kind}] Building PDF from scratch…`);

  const base = await buildBaseData(mystery);
  const data = cfg.buildData(mystery, base);

  await renderPdf({
    templateName: cfg.templateName,
    data,
    outFile,
    themeKey: cfg.themeKey,
  });

  const stat = await fsp.stat(outFile);
  console.log(`✅ [${kind}] PDF built — ${(stat.size / 1024).toFixed(0)} KB`);

  return {
    kind,
    fileName: cfg.fileName,
    absolutePath: outFile,
    relativePath: toRelativePath(outFile),
    fileSize: stat.size,
    mimeType: "application/pdf",
    cached: false,
  };
}

// ================================================================
// 👁️ VIEW PDF
// ================================================================
exports.viewMysteryPdf = async (req, res) => {
  try {
    // 🔒 Auth check FIRST — always required, even in demo mode
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const { id, kind } = req.params;

    // 🎭 DEMO MODE — only reached if authenticated
    if (isDemoMode()) {
      const demoPdf = getDemoPdfPath(kind);
      if (!demoPdf) {
        return res.status(404).json({
          success: false,
          message: `Demo PDF "${kind}" not uploaded. Add it to backend/public/demo/pdf/`,
        });
      }

      console.log(
        `🎭 [Demo] Serving ${kind} — ${(demoPdf.size / 1024).toFixed(0)} KB`,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${demoPdf.fileName}"`,
      );
      res.setHeader("Content-Length", demoPdf.size);
      res.setHeader("X-PDF-Cached", "demo");

      const stream = fs.createReadStream(demoPdf.path);
      return stream.pipe(res);
    }

    // Normal mode (unchanged)
    const forceRebuild = req.query.rebuild === "1";

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

    console.log(
      `📄 [View PDF] ${kind} for mystery ${id}${forceRebuild ? " (forced rebuild)" : ""}`,
    );
    const result = await buildSinglePdf(mystery, kind, { forceRebuild });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${result.fileName}"`,
    );
    res.setHeader("Content-Length", result.fileSize);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-PDF-Cached", result.cached ? "true" : "false");

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
// ⬇️ DOWNLOAD PDF
// ================================================================
exports.downloadMysteryPdf = async (req, res) => {
  try {
    const { id, kind } = req.params;

    // 🎭 DEMO MODE
    if (isDemoMode()) {
      const demoPdf = getDemoPdfPath(kind);
      if (!demoPdf) {
        return res.status(404).json({
          success: false,
          message: `Demo PDF "${kind}" not uploaded. Add it to backend/public/demo/pdf/`,
        });
      }

      console.log(
        `🎭 [Demo] Download ${kind} — ${(demoPdf.size / 1024).toFixed(0)} KB`,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${demoPdf.fileName}"`,
      );
      res.setHeader("Content-Length", demoPdf.size);
      res.setHeader("X-PDF-Cached", "demo");

      const stream = fs.createReadStream(demoPdf.path);
      return stream.pipe(res);
    }

    // Normal mode
    const userId = req.user?.id || req.user?._id;
    const forceRebuild = req.query.rebuild === "1";

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

    console.log(
      `📥 [Download PDF] ${kind} for mystery ${id}${forceRebuild ? " (forced rebuild)" : ""}`,
    );
    const result = await buildSinglePdf(mystery, kind, { forceRebuild });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader("Content-Length", result.fileSize);
    res.setHeader("X-PDF-Cached", result.cached ? "true" : "false");

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
// 📊 PDF STATUS
// ================================================================
exports.getPdfStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // 🎭 DEMO MODE
    if (isDemoMode()) {
      const status = {};
      for (const [kind, fileName] of Object.entries(
        require("../services/demoService").DEMO_PDF_FILES,
      )) {
        const demoPdf = getDemoPdfPath(kind);
        status[kind] = {
          exists: !!demoPdf,
          fileName,
          fileSize: demoPdf?.size || 0,
          downloadUrl: `/mysteries/${id}/pdf/${kind}/download`,
          viewUrl: `/mysteries/${id}/pdf/${kind}?inline=1`,
        };
      }
      return res.json({ success: true, demo: true, data: status });
    }

    const userId = req.user?.id || req.user?._id;
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
