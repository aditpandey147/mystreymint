// backend/services/zipService.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

// ================================================================
// ✅ ARCHIVER — bulletproof multi-version loader
// ================================================================
let createArchive;
try {
  const archiverPkg = require("archiver");

  if (typeof archiverPkg === "function") {
    createArchive = archiverPkg;
  } else if (archiverPkg && typeof archiverPkg.default === "function") {
    createArchive = archiverPkg.default;
  } else if (archiverPkg && typeof archiverPkg.create === "function") {
    createArchive = archiverPkg.create;
  } else if (archiverPkg && typeof archiverPkg.archiver === "function") {
    createArchive = archiverPkg.archiver;
  } else {
    throw new Error(
      "Unsupported archiver export shape. Keys: " +
        Object.keys(archiverPkg || {}).join(", ")
    );
  }
  console.log("✅ archiver loaded — factory type:", typeof createArchive);
} catch (err) {
  console.error("❌ Failed to load archiver:", err.message);
  throw err;
}

// ================================================================
// 📁 PATHS
// ================================================================
const EXPORTS_ROOT_ABS = path.join(__dirname, "../uploads/exports");
const EXPORTS_PREFIX = "/uploads/exports";

// ================================================================
// 🔁 PATH HELPERS (duplicated from pdfService to avoid circular deps)
// ================================================================
function toRelativePath(absolutePath) {
  if (!absolutePath) return absolutePath;
  return absolutePath
    .replace(EXPORTS_ROOT_ABS, EXPORTS_PREFIX)
    .replace(/\\/g, "/");
}

function toAbsolutePath(relativePath) {
  if (!relativePath) return relativePath;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  if (relativePath.startsWith(EXPORTS_PREFIX)) {
    return path.join(
      EXPORTS_ROOT_ABS,
      relativePath.replace(EXPORTS_PREFIX, "").replace(/^\//, "")
    );
  }
  if (relativePath.startsWith("/")) return relativePath;
  return path.join(EXPORTS_ROOT_ABS, relativePath);
}

// ================================================================
// 📁 ENSURE DIR
// ================================================================
async function ensureDir(dir) {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

// ================================================================
// 🖼️ DOWNLOAD AN IMAGE URL → LOCAL FILE
// ================================================================
async function downloadImage(url, outFile) {
  if (!url) return null;

  try {
    // If it's already a relative local path, resolve it
    let targetUrl = url;
    if (url.startsWith(EXPORTS_PREFIX) || url.startsWith("/uploads/")) {
      // Local file — just copy it
      const src = toAbsolutePath(url);
      if (fs.existsSync(src)) {
        await fsp.copyFile(src, outFile);
        return outFile;
      }
      return null;
    }

    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fsp.writeFile(outFile, buf);
    return outFile;
  } catch (err) {
    console.error(`❌ Failed to download ${url}:`, err.message);
    return null;
  }
}

// ================================================================
// 📦 BUILD COMPLETE MYSTERY KIT ZIP
// ================================================================
async function buildMysteryZip(mysteryDoc, pdfResults) {
  const mystery = mysteryDoc.toObject ? mysteryDoc.toObject() : mysteryDoc;

  const mysteryId = String(mystery._id);
  const zipDir = path.join(EXPORTS_ROOT_ABS, mysteryId);
  await ensureDir(zipDir);

  const zipFileName = `MysteryMint_Kit_${mysteryId.slice(-8)}.zip`;
  const zipFilePath = path.join(zipDir, zipFileName); // absolute

  // -------- Prepare temp images folder --------
  const imagesDir = path.join(zipDir, "_images_temp");
  await ensureDir(imagesDir);

  const characterImageDir = path.join(imagesDir, "Characters");
  const sceneImageDir = path.join(imagesDir, "Crime_Scenes");
  await ensureDir(characterImageDir);
  await ensureDir(sceneImageDir);

  // Cover
  let coverLocalPath = null;
  if (mystery.images?.cover) {
    coverLocalPath = path.join(imagesDir, "Mystery_Cover.png");
    await downloadImage(mystery.images.cover, coverLocalPath);
  }

  // Character portraits
  const characterDownloads = [];
  for (const c of mystery.images?.characters || []) {
    if (!c.url) continue;
    const safeName = (c.name || c.characterId || "character")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const out = path.join(characterImageDir, `${safeName}.png`);
    const ok = await downloadImage(c.url, out);
    if (ok) characterDownloads.push({ ...c, localPath: out });
  }

  // Scene images
  const sceneDownloads = [];
  for (const s of mystery.images?.scenes || []) {
    if (!s.url) continue;
    const safeName = (s.location || "scene")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const out = path.join(sceneImageDir, `${safeName}.png`);
    const ok = await downloadImage(s.url, out);
    if (ok) sceneDownloads.push({ ...s, localPath: out });
  }

  // -------- Build ZIP --------
  return new Promise((resolve, reject) => {
    let settled = false;

    const output = fs.createWriteStream(zipFilePath);
    const archive = createArchive("zip", { zlib: { level: 9 } });

    output.on("close", async () => {
      if (settled) return;
      settled = true;

      const size = archive.pointer();
      console.log(
        `✅ ZIP built: ${zipFileName} (${(size / 1024).toFixed(1)} KB)`
      );

      try {
        await fsp.rm(imagesDir, { recursive: true, force: true });
      } catch (err) {
        console.warn("⚠️ Temp cleanup failed:", err.message);
      }

      resolve({
        fileName: zipFileName,
        filePath: toRelativePath(zipFilePath), // ✅ relative
        fileSize: size,
        mimeType: "application/zip",
      });
    });

    output.on("error", (err) => {
      if (settled) return;
      settled = true;
      console.error("❌ Output stream error:", err);
      reject(err);
    });

    archive.on("error", (err) => {
      if (settled) return;
      settled = true;
      console.error("❌ Zip error:", err);
      reject(err);
    });

    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("⚠️ Zip warning:", err.message);
      } else {
        console.error("❌ Zip warning (fatal):", err);
        if (!settled) {
          settled = true;
          reject(err);
        }
      }
    });

    archive.pipe(output);

    // ---- Player_Kit ----
    const playerKitFiles = [
      { kind: "story", name: "Mystery_Story.pdf" },
      { kind: "suspects", name: "Suspect_Cards.pdf" },
      { kind: "clues", name: "Clues_and_Evidence.pdf" },
      { kind: "puzzles", name: "Puzzle_Sheets.pdf" },
      { kind: "instructions", name: "Player_Instructions.pdf" },
    ];

    for (const file of playerKitFiles) {
      const match = pdfResults.find(
        (r) => r.kind === file.kind && r.status === "ready"
      );
      if (match && match.filePath) {
        // ✅ Resolve relative path → absolute for reading from disk
        const abs = toAbsolutePath(match.filePath);
        if (fs.existsSync(abs)) {
          archive.file(abs, { name: `Player_Kit/${file.name}` });
        } else {
          console.warn(`⚠️ Skipping missing file: ${file.name}`);
        }
      }
    }

    // ---- Game_Master ----
    const gmFile = pdfResults.find(
      (r) => r.kind === "solution" && r.status === "ready"
    );
    if (gmFile && gmFile.filePath) {
      const abs = toAbsolutePath(gmFile.filePath);
      if (fs.existsSync(abs)) {
        archive.file(abs, { name: "Game_Master/Solution_Guide.pdf" });
      }
    }

    // ---- Images ----
    if (coverLocalPath && fs.existsSync(coverLocalPath)) {
      archive.file(coverLocalPath, { name: "Images/Mystery_Cover.png" });
    }

    for (const c of characterDownloads) {
      if (fs.existsSync(c.localPath)) {
        const safeName = (c.name || c.characterId || "character")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        archive.file(c.localPath, {
          name: `Images/Characters/${safeName}.png`,
        });
      }
    }

    for (const s of sceneDownloads) {
      if (fs.existsSync(s.localPath)) {
        const safeName = (s.location || "scene")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        archive.file(s.localPath, {
          name: `Images/Crime_Scenes/${safeName}.png`,
        });
      }
    }

    // ---- README ----
    const readmeContent = `
MysteryMint AI — ${mystery.title}
${"=".repeat(50)}

Genre:      ${mystery.genre}
Setting:    ${mystery.setting}
Difficulty: ${mystery.difficulty}
Players:    ${mystery.playerCount}
Duration:   ${mystery.duration} minutes
Audience:   ${mystery.targetAudience}

Generated:  ${new Date().toLocaleString()}

------------------------------------------------------------
WHAT'S INSIDE
------------------------------------------------------------

Player_Kit/
  • Mystery_Story.pdf
  • Suspect_Cards.pdf
  • Clues_and_Evidence.pdf
  • Puzzle_Sheets.pdf
  • Player_Instructions.pdf

Game_Master/
  • Solution_Guide.pdf

Images/
  • Mystery_Cover.png
  • Characters/
  • Crime_Scenes/

------------------------------------------------------------
HOW TO PLAY
------------------------------------------------------------

1. Read Player_Instructions.pdf first.
2. Print Suspect_Cards.pdf for each player.
3. Read Mystery_Story.pdf aloud.
4. Distribute Clues_and_Evidence.pdf and Puzzle_Sheets.pdf.
5. Only the Game Master should read Game_Master/Solution_Guide.pdf.

Enjoy your mystery.
— MysteryMint AI
`;

    archive.append(readmeContent, { name: "README.txt" });

    archive.finalize().catch((err) => {
      if (settled) return;
      settled = true;
      console.error("❌ archive.finalize() failed:", err);
      reject(err);
    });
  });
}

module.exports = {
  buildMysteryZip,
  downloadImage,
  ensureDir,
  toRelativePath,
  toAbsolutePath,
  EXPORTS_ROOT_ABS,
  EXPORTS_PREFIX,
};