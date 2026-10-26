// backend/controllers/exportController.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const Mystery = require("../models/Mystery");
const Export = require("../models/Export");
const pdfService = require("../services/pdfService");
const zipService = require("../services/zipService");

// ================================================================
// 📁 PATH HELPERS
// ================================================================
const EXPORTS_ROOT_ABS = path.join(__dirname, "../uploads/exports");
const EXPORTS_PREFIX = "/uploads/exports";

function toAbsolutePath(p) {
  if (!p) return p;
  if (/^https?:\/\//i.test(p)) return p;

  if (p.startsWith(EXPORTS_PREFIX)) {
    return path.join(
      EXPORTS_ROOT_ABS,
      p.replace(EXPORTS_PREFIX, "").replace(/^\//, "")
    );
  }

  if (p.startsWith("/")) return p;
  return path.join(EXPORTS_ROOT_ABS, p);
}

const EXPORTABLE_STATUSES = ["completed", "needs_review"];

// ================================================================
// 🏗️ BUILD ALL EXPORTS FOR A MYSTERY — WITH CACHING
// POST /api/mysteries/:id/export
// ================================================================
exports.buildExports = async (req, res) => {
  const startedAt = Date.now();
  const userId = req.user.id || req.user._id;
  const mysteryId = req.params.id;
  const forceRebuild = req.query.rebuild === "1";

  try {
    // ---------- LOAD MYSTERY ----------
    const mystery = await Mystery.findOne({ _id: mysteryId, userId });
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    if (!EXPORTABLE_STATUSES.includes(mystery.generationStatus)) {
      return res.status(400).json({
        success: false,
        message: `Mystery is not ready for export (status: ${mystery.generationStatus})`,
        status: mystery.generationStatus,
      });
    }

    // ─────────────────────────────────────────────────────────
    // 🎯 CACHE CHECK — return existing kit if available
    // ─────────────────────────────────────────────────────────
    if (!forceRebuild) {
      const existingZip = await Export.findOne({
        mysteryId,
        userId,
        type: "zip",
        kind: "complete_kit",
        status: "ready",
      }).sort({ createdAt: -1 });

      if (existingZip && existingZip.filePath) {
        const absPath = toAbsolutePath(existingZip.filePath);
        try {
          const stat = await fsp.stat(absPath);
          if (stat.size > 1000) {
            console.log(
              `♻️  [Kit] Cached ZIP found — ${(stat.size / 1024 / 1024).toFixed(1)} MB`
            );

            const pdfExports = await Export.find({
              mysteryId,
              userId,
              type: "pdf",
              status: "ready",
            });

            const coverExport = await Export.findOne({
              mysteryId,
              userId,
              type: "image",
              kind: "cover",
              status: "ready",
            });

            return res.json({
              success: true,
              message: "Exports cached — returning existing kit",
              cached: true,
              mysteryId,
              zip: {
                id: existingZip._id,
                fileName: existingZip.fileName,
                fileSize: existingZip.fileSize,
                status: existingZip.status,
                downloadUrl: `/exports/${existingZip._id}/download`,
              },
              pdfs: pdfExports.map((e) => ({
                id: e._id,
                kind: e.kind,
                fileName: e.fileName,
                fileSize: e.fileSize,
                downloadUrl: `/exports/${e._id}/download`,
              })),
              cover: coverExport
                ? {
                    id: coverExport._id,
                    url: coverExport.filePath,
                    downloadUrl: `/exports/${coverExport._id}/download`,
                  }
                : null,
              meta: { elapsedMs: Date.now() - startedAt },
            });
          }
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.warn("⚠️ Kit cache check failed:", err.message);
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────
    // 🖨️ REBUILD — only reaches here on first click or forced rebuild
    // ─────────────────────────────────────────────────────────
    console.log(
      `📦 Building exports for mystery: ${mystery.title}${
        forceRebuild ? " (forced rebuild)" : ""
      }`
    );

    // ---------- DELETE OLD EXPORTS ----------
    const oldExports = await Export.find({ mysteryId, userId });
    for (const old of oldExports) {
      try {
        if (old.filePath && !/^https?:\/\//i.test(old.filePath)) {
          const abs = toAbsolutePath(old.filePath);
          if (fs.existsSync(abs)) {
            await fsp.unlink(abs);
          }
        }
      } catch (err) {
        console.warn("⚠️ Failed to delete old export file:", err.message);
      }
    }
    await Export.deleteMany({ mysteryId, userId });

    // ---------- BUILD PDFs ----------
    const { results: pdfResults } = await pdfService.buildMysteryPdfs(mystery);

    // ---------- SAVE PDF EXPORTS ----------
    const savedPdfExports = [];
    for (const r of pdfResults) {
      if (r.status === "ready") {
        const doc = await Export.create({
          mysteryId,
          userId,
          type: "pdf",
          kind: r.kind,
          filePath: r.filePath,
          fileName: r.fileName,
          fileSize: r.fileSize || 0,
          mimeType: "application/pdf",
          status: "ready",
          buildCompletedAt: new Date(),
        });
        savedPdfExports.push(doc);
      } else {
        try {
          await Export.create({
            mysteryId,
            userId,
            type: "pdf",
            kind: r.kind,
            filePath: "",
            fileName: r.fileName,
            status: "failed",
            error: r.error || "Unknown error",
            buildCompletedAt: new Date(),
          });
        } catch (saveErr) {
          console.error(
            `⚠️ Failed to save failed-export record (${r.kind}):`,
            saveErr.message
          );
        }
      }
    }

    // ---------- SAVE COVER IMAGE EXPORT ----------
    let coverExport = null;
    if (mystery.images?.cover) {
      try {
        coverExport = await Export.create({
          mysteryId,
          userId,
          type: "image",
          kind: "cover",
          filePath: mystery.images.cover,
          fileName: "Mystery_Cover.png",
          mimeType: "image/png",
          status: "ready",
          buildCompletedAt: new Date(),
        });
      } catch (coverErr) {
        console.error("⚠️ Failed to save cover export:", coverErr.message);
      }
    }

    // ---------- BUILD ZIP ----------
    console.log("🗜️  Building ZIP...");
    let zipExport = null;
    try {
      const zipResult = await zipService.buildMysteryZip(mystery, pdfResults);

      zipExport = await Export.create({
        mysteryId,
        userId,
        type: "zip",
        kind: "complete_kit",
        filePath: zipResult.filePath,
        fileName: zipResult.fileName,
        fileSize: zipResult.fileSize,
        mimeType: "application/zip",
        status: "ready",
        buildCompletedAt: new Date(),
      });
    } catch (zipErr) {
      console.error("❌ ZIP build failed:", zipErr.message);
      try {
        zipExport = await Export.create({
          mysteryId,
          userId,
          type: "zip",
          kind: "complete_kit",
          filePath: "",
          fileName: "MysteryMint_Kit.zip",
          status: "failed",
          error: zipErr.message,
          buildCompletedAt: new Date(),
        });
      } catch (saveErr) {
        console.error("⚠️ Failed to save failed-ZIP record:", saveErr.message);
      }
    }

    // ---------- LINK EXPORTS TO MYSTERY ----------
    mystery.exportIds = [...savedPdfExports, coverExport, zipExport]
      .filter(Boolean)
      .map((e) => e._id);
    await mystery.save();

    const elapsedMs = Date.now() - startedAt;
    console.log(`🎉 Exports complete in ${(elapsedMs / 1000).toFixed(1)}s`);

    return res.json({
      success: true,
      message: "Exports built successfully",
      cached: false,
      mysteryId,
      zip: zipExport
        ? {
            id: zipExport._id,
            fileName: zipExport.fileName,
            fileSize: zipExport.fileSize,
            status: zipExport.status,
            downloadUrl: `/exports/${zipExport._id}/download`,
          }
        : null,
      pdfs: savedPdfExports.map((e) => ({
        id: e._id,
        kind: e.kind,
        fileName: e.fileName,
        fileSize: e.fileSize,
        downloadUrl: `/exports/${e._id}/download`,
      })),
      cover: coverExport
        ? {
            id: coverExport._id,
            url: coverExport.filePath,
            downloadUrl: `/exports/${coverExport._id}/download`,
          }
        : null,
      meta: { elapsedMs },
    });
  } catch (err) {
    console.error("❌ buildExports failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to build exports",
    });
  }
};

// ================================================================
// 📥 DOWNLOAD AN EXPORT
// GET /api/exports/:id/download
// ================================================================
exports.downloadExport = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const exp = await Export.findOne({ _id: req.params.id, userId });
    if (!exp) {
      return res
        .status(404)
        .json({ success: false, message: "Export not found" });
    }

    if (exp.status !== "ready") {
      return res.status(400).json({
        success: false,
        message: `Export is not ready (status: ${exp.status})`,
      });
    }

    if (exp.filePath && /^https?:\/\//i.test(exp.filePath)) {
      return res.redirect(exp.filePath);
    }

    const absPath = toAbsolutePath(exp.filePath);

    if (!absPath || !fs.existsSync(absPath)) {
      return res.status(404).json({
        success: false,
        message: "Export file missing on disk",
      });
    }

    res.setHeader("Content-Type", exp.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exp.fileName}"`
    );

    const stat = await fsp.stat(absPath);
    res.setHeader("Content-Length", stat.size);

    const stream = fs.createReadStream(absPath);
    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("❌ Stream error:", err.message);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "File stream failed" });
      }
    });
  } catch (err) {
    console.error("❌ downloadExport failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to download export",
    });
  }
};

// ================================================================
// 📋 LIST EXPORTS FOR A MYSTERY
// GET /api/mysteries/:id/exports
// ================================================================
exports.listExports = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const mysteryId = req.params.id;

    const mystery = await Mystery.findOne({ _id: mysteryId, userId });
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    const exports = await Export.find({ mysteryId, userId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: exports.length,
      data: exports.map((e) => ({
        id: e._id,
        type: e.type,
        kind: e.kind,
        fileName: e.fileName,
        fileSize: e.fileSize,
        mimeType: e.mimeType,
        status: e.status,
        error: e.error,
        createdAt: e.createdAt,
        downloadUrl:
          e.status === "ready" ? `/exports/${e._id}/download` : null,
      })),
    });
  } catch (err) {
    console.error("❌ listExports failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to list exports",
    });
  }
};

// ================================================================
// 🧹 CLEAR EXPORT CACHE (optional endpoint)
// DELETE /api/mysteries/:id/exports/cache
// ================================================================
exports.clearExportCache = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const mysteryId = req.params.id;

    const mystery = await Mystery.findOne({ _id: mysteryId, userId });
    if (!mystery) {
      return res
        .status(404)
        .json({ success: false, message: "Mystery not found" });
    }

    await Export.deleteMany({ mysteryId, userId });

    const dir = path.join(EXPORTS_ROOT_ABS, String(mysteryId));
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});

    mystery.exportIds = [];
    await mystery.save();

    return res.json({ success: true, message: "Export cache cleared" });
  } catch (err) {
    console.error("❌ clearExportCache failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to clear cache",
    });
  }
};
