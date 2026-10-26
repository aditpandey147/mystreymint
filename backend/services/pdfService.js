// backend/services/pdfService.js
const fs = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// ================================================================
// 📁 PATHS
// ================================================================
const TEMPLATES_DIR = path.join(__dirname, "../templates/pdf");
const EXPORTS_ROOT_ABS = path.join(__dirname, "../uploads/exports");
const EXPORTS_PREFIX = "/uploads/exports";
const UPLOADS_ROOT_ABS = path.join(__dirname, "../uploads");

// ================================================================
// 🎨 DYNAMIC THEME POOL — 8 palettes
// ================================================================
const PDF_THEMES = [
  {
    gradient: "linear-gradient(135deg, #001715 0%, #002725 60%, #002b22 100%)",
    accent: "#ffd36a",
    accentBorder: "rgba(255,211,106,.5)",
    glow: "rgba(255,211,106,.15)",
    label: "STORY",
    title: "Mystery Story",
  },
  {
    gradient: "linear-gradient(135deg, #0f1a14 0%, #14261c 60%, #0d2019 100%)",
    accent: "#86efac",
    accentBorder: "rgba(134,239,172,.5)",
    glow: "rgba(134,239,172,.15)",
    label: "CLUES",
    title: "Clues & Evidence",
  },
  {
    gradient: "linear-gradient(135deg, #0b1a1f 0%, #0f2830 60%, #0b2027 100%)",
    accent: "#00d5d8",
    accentBorder: "rgba(0,213,216,.5)",
    glow: "rgba(0,213,216,.15)",
    label: "PUZZLES",
    title: "Puzzle Sheets",
  },
  {
    gradient: "linear-gradient(135deg, #140f1e 0%, #1e1233 60%, #180f26 100%)",
    accent: "#a78bfa",
    accentBorder: "rgba(167,139,250,.5)",
    glow: "rgba(167,139,250,.15)",
    label: "SOLUTION",
    title: "Solution Guide",
  },
  {
    gradient: "linear-gradient(135deg, #2a0808 0%, #4a1010 60%, #1a0404 100%)",
    accent: "#ff8fa8",
    accentBorder: "rgba(255,143,168,.5)",
    glow: "rgba(255,143,168,.15)",
    label: "GUIDE",
    title: "Player Instructions",
  },
  {
    gradient: "linear-gradient(135deg, #1e1120 0%, #2a1730 60%, #221426 100%)",
    accent: "#f472b6",
    accentBorder: "rgba(244,114,182,.5)",
    glow: "rgba(244,114,182,.15)",
    label: "GUIDE",
    title: "Player Instructions",
  },
  {
    gradient: "linear-gradient(135deg, #1a0f1e 0%, #241531 60%, #1e1120 100%)",
    accent: "#f5b942",
    accentBorder: "rgba(245,185,66,.5)",
    glow: "rgba(245,185,66,.15)",
    label: "CHARACTERS",
    title: "Suspect Cards",
  },
  {
    gradient: "linear-gradient(135deg, #0b1220 0%, #101b2e 60%, #0f172a 100%)",
    accent: "#7dd3fc",
    accentBorder: "rgba(125,211,252,.5)",
    glow: "rgba(125,211,252,.15)",
    label: "STORY",
    title: "Mystery Story",
  },
];

// Deterministic picker — same seed always gives the same theme
function pickTheme(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PDF_THEMES[Math.abs(hash) % PDF_THEMES.length];
}

// Title size class by character count
function pickTitleSizeClass(title = "") {
  const len = String(title).length;
  if (len <= 20) return "title-short";
  if (len <= 40) return "title-medium";
  if (len <= 60) return "title-long";
  return "title-xlong";
}

// Badge label per PDF kind
function badgeForKind(kind) {
  const map = {
    story: "The Story",
    suspects: "The Suspects",
    clues: "Clues & Evidence",
    puzzles: "Puzzle Sheets",
    solution: "The Solution",
    instructions: "Player Instructions",
  };
  return map[kind] || "A Mystery Game";
}

// ================================================================
// 🖼️ EMBED IMAGE AS BASE64 DATA URL
// Puppeteer's setContent() has no website origin, so "/uploads/..."
// paths can't load. We read the file from disk and inline it.
// ================================================================
async function imageToDataUrl(imagePath) {
  if (!imagePath) return "";

  // Already a data URL → keep as-is
  if (String(imagePath).startsWith("data:")) return imagePath;

  // Remote URL → fetch and inline
  if (/^https?:\/\//i.test(imagePath)) {
    try {
      const res = await fetch(imagePath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/png";
      return `data:${contentType};base64,${buf.toString("base64")}`;
    } catch (err) {
      console.warn(`⚠️ Remote image fetch failed: ${imagePath}`, err.message);
      return "";
    }
  }

  // Local path — map "/uploads/xyz" → <backend>/uploads/xyz
  let relative = String(imagePath).replace(/\\/g, "/");

  if (relative.startsWith("/uploads/")) {
    relative = relative.replace(/^\/uploads\//, "");
  } else if (relative.startsWith("uploads/")) {
    relative = relative.replace(/^uploads\//, "");
  } else if (relative.startsWith("/")) {
    relative = relative.slice(1);
  }

  const absolutePath = path.join(UPLOADS_ROOT_ABS, relative);

  try {
    const buffer = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).slice(1).toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "jpeg"
        : ext === "svg"
          ? "svg+xml"
          : ext || "png";
    return `data:image/${mime};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn(
      `⚠️ Could not embed image "${imagePath}" → ${absolutePath}:`,
      err.message,
    );
    return "";
  }
}

// ================================================================
// 🔁 PATH HELPERS
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
      relativePath.replace(EXPORTS_PREFIX, "").replace(/^\//, ""),
    );
  }
  if (relativePath.startsWith("/")) return relativePath;
  return path.join(EXPORTS_ROOT_ABS, relativePath);
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

// ================================================================
// 🧩 TEMPLATE ENGINE
// ================================================================
const templateCache = new Map();
let helpersRegistered = false;

function registerHelpers() {
  if (helpersRegistered) return;
  helpersRegistered = true;

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("lt", (a, b) => a < b);
  Handlebars.registerHelper("gt", (a, b) => a > b);
  Handlebars.registerHelper("upper", (s) => String(s || "").toUpperCase());

  // Safe: escapes the text first, then turns line breaks into <br>
  Handlebars.registerHelper(
    "nl2br",
    (s) =>
      new Handlebars.SafeString(
        Handlebars.escapeExpression(String(s || "")).replace(/\n/g, "<br>"),
      ),
  );

  Handlebars.registerHelper("year", () => new Date().getFullYear());

  // 0-based @index → 1-based number (used by puzzles templates)
  Handlebars.registerHelper("inc", (v) => Number(v) + 1);
}

async function loadTemplate(name) {
  registerHelpers();

  // In production, cache compiled templates. In development, always
  // re-read the file so template edits show up without a server restart.
  const useCache = process.env.NODE_ENV === "production";
  if (useCache && templateCache.has(name)) return templateCache.get(name);

  const file = path.join(TEMPLATES_DIR, `${name}.html`);
  const raw = await fs.readFile(file, "utf8");

  const compiled = Handlebars.compile(raw, {
    noEscape: false,
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  });

  if (useCache) templateCache.set(name, compiled);
  return compiled;
}

async function renderTemplate(templateName, data) {
  const template = await loadTemplate(templateName);
  return template(data);
}

// ================================================================
// 🖨️ PUPPETEER — SINGLETON
// ================================================================
let _browser = null;

async function getBrowser() {
  if (_browser && _browser.isConnected()) return _browser;

  console.log("🚀 Launching Puppeteer...");
  _browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--force-color-profile=srgb",
    ],
  });
  return _browser;
}

async function closeBrowser() {
  if (_browser && _browser.isConnected()) {
    await _browser.close();
    _browser = null;
    console.log("🔒 Puppeteer closed");
  }
}

// ================================================================
// 🖨️ RENDER HTML → PDF
// ================================================================
async function renderPdf({
  templateName,
  data,
  outFile,
  landscape = false,
  themeKey = "story",
}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Deterministic theme: same mystery + same PDF kind → same color
    const seed = `${data.mysteryId || data.title || "mystery"}-${themeKey}`;
    const theme = pickTheme(seed);

    const enrichedData = {
      ...data,
      theme,
      titleSizeClass: pickTitleSizeClass(data.title || ""),
      coverBadge: badgeForKind(themeKey),
    };

    const html = await renderTemplate(templateName, enrichedData);

    console.log(
      `🎨 [${templateName}] theme accent=${theme.accent} badge=${enrichedData.coverBadge} cover=${
        data.coverImage ? "yes" : "NO"
      }`,
    );

    // ─────────────────────────────────────────────────────────
    // 🚫 Request interception — block everything external
    // ─────────────────────────────────────────────────────────
    const allowWebFonts = process.env.PDF_WEB_FONTS === "1";

    await page.setRequestInterception(true);

    page.on("request", (req) => {
      const url = req.url();

      // data: URLs (our embedded base64 images) — always allow
      if (url.startsWith("data:") || url.startsWith("about:")) {
        return req.continue();
      }

      // Google Fonts — only if explicitly enabled
      if (allowWebFonts && /fonts\.(googleapis|gstatic)\.com/.test(url)) {
        return req.continue();
      }

      // Block everything else
      return req.abort();
    });

    page.on("requestfailed", (req) => {
      const url = req.url();
      if (
        /\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i.test(url) &&
        !url.startsWith("data:")
      ) {
        console.warn(
          `⚠️ External image blocked: ${url.slice(0, 120)} — ${
            req.failure()?.errorText
          }`,
        );
      }
    });

    // Wait only for DOM — no network wait
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // ─────────────────────────────────────────────────────────
    // 🎨 Force-apply theme colors (backup)
    // ─────────────────────────────────────────────────────────
    await page.evaluate((t) => {
      const cover = document.querySelector(".cover");
      if (cover) cover.style.background = t.gradient;

      const overlay = document.querySelector(".cover-overlay");
      if (overlay) overlay.style.background = t.gradient;

      document
        .querySelectorAll(".cover-eyebrow, .cover-meta-label")
        .forEach((el) => (el.style.color = t.accent));

      document
        .querySelectorAll(".cover-eyebrow, .cover-meta, .cover-frame")
        .forEach((el) => (el.style.borderColor = t.accentBorder));

      document
        .querySelectorAll(".cover-divider .line, .cover-divider .dot")
        .forEach((el) => (el.style.background = t.accent));

      document.documentElement.style.background = "#ffffff";
      document.body.style.background = "#ffffff";
    }, theme);

    // ─────────────────────────────────────────────────────────
    // ⏱️ Wait for fonts (max 4s) — never hang
    // ─────────────────────────────────────────────────────────
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, 4000)),
    ]);

    // ─────────────────────────────────────────────────────────
    // ⏱️ Wait for images (data URLs are instant)
    // ─────────────────────────────────────────────────────────
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 3000);
          });
        }),
      );
    });

    await new Promise((r) => setTimeout(r, 200));

    // ─────────────────────────────────────────────────────────
    // 📄 Render PDF
    // ─────────────────────────────────────────────────────────
    await page.pdf({
      path: outFile,
      format: "A4",
      landscape,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    return outFile;
  } finally {
    await page.close();
  }
}

// ================================================================
// 📄 BASE DATA BUILDER — ASYNC, EMBEDS ALL IMAGES AS DATA URLs
// ================================================================
async function buildBaseData(mystery) {
  // Cover → data URL
  const coverImage = mystery.images?.cover
    ? await imageToDataUrl(mystery.images.cover)
    : "";

  // Scene images → data URLs
  const sceneImages = (
    await Promise.all(
      (mystery.images?.scenes || [])
        .filter((s) => s && s.url)
        .map(async (s) => ({
          location: s.location || "Scene",
          url: await imageToDataUrl(s.url),
        })),
    )
  ).filter((s) => s.url);

  // Character portraits → data URLs
  const characterPortraits = await Promise.all(
    (mystery.images?.characters || []).map(async (c) => ({
      characterId: c.characterId || "",
      name: c.name || "",
      url: c.url ? await imageToDataUrl(c.url) : null,
    })),
  );

  return {
    mysteryId: String(mystery._id || ""),
    title: mystery.title || "Untitled Mystery",
    genre: mystery.genre || "",
    setting: mystery.setting || "",
    difficulty: mystery.difficulty || "Medium",
    playerCount: mystery.playerCount || "4-8",
    duration: mystery.duration || 60,
    targetAudience: mystery.targetAudience || "Adults",
    coverImage,
    sceneImages,
    characterPortraits,
    hasCover: !!coverImage,
    hasScenes: sceneImages.length > 0,
    generatedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

// ================================================================
// 📊 FILE RESULT HELPERS
// ================================================================
async function fileResult(kind, fileName, outPath) {
  const stat = await fs.stat(outPath);
  return {
    kind,
    fileName,
    filePath: toRelativePath(outPath),
    fileSize: stat.size,
    mimeType: "application/pdf",
    status: "ready",
  };
}

function failedResult(kind, fileName, err) {
  return {
    kind,
    fileName,
    status: "failed",
    error: err.message,
  };
}

// ================================================================
// 🎯 BUILD ALL PDFs
// ================================================================
async function buildMysteryPdfs(mysteryDoc) {
  const mystery = mysteryDoc.toObject ? mysteryDoc.toObject() : mysteryDoc;

  const mysteryId = String(mystery._id);
  const pdfDir = path.join(EXPORTS_ROOT_ABS, mysteryId, "pdf");
  await ensureDir(pdfDir);

  const base = await buildBaseData(mystery);
  const results = [];

  // -------- 1. Story --------
  try {
    const out = path.join(pdfDir, "Mystery_Story.pdf");
    console.log("🖨️  Story PDF");
    await renderPdf({
      templateName: "story",
      data: { ...base, story: mystery.story || {} },
      outFile: out,
      themeKey: "story",
    });
    results.push(await fileResult("story", "Mystery_Story.pdf", out));
  } catch (err) {
    console.error("❌ Story PDF failed:", err.message);
    results.push(failedResult("story", "Mystery_Story.pdf", err));
  }

  // -------- 2. Suspect Cards --------
  try {
    const out = path.join(pdfDir, "Suspect_Cards.pdf");
    console.log("🖨️  Suspect Cards PDF");

    const characters = (mystery.characters || []).map((c) => {
      const portrait = base.characterPortraits.find(
        (img) => img.characterId === c.id,
      );
      return { ...c, portraitUrl: portrait?.url || null };
    });

    await renderPdf({
      templateName: "suspect-cards",
      data: { ...base, characters },
      outFile: out,
      themeKey: "suspects",
    });
    results.push(await fileResult("suspects", "Suspect_Cards.pdf", out));
  } catch (err) {
    console.error("❌ Suspect Cards PDF failed:", err.message);
    results.push(failedResult("suspects", "Suspect_Cards.pdf", err));
  }

  // -------- 3. Clues & Evidence --------
  try {
    const out = path.join(pdfDir, "Clues_and_Evidence.pdf");
    console.log("🖨️  Clues & Evidence PDF");
    await renderPdf({
      templateName: "clues",
      data: {
        ...base,
        clues: mystery.clues || [],
        evidence: mystery.evidence || [],
      },
      outFile: out,
      themeKey: "clues",
    });
    results.push(await fileResult("clues", "Clues_and_Evidence.pdf", out));
  } catch (err) {
    console.error("❌ Clues PDF failed:", err.message);
    results.push(failedResult("clues", "Clues_and_Evidence.pdf", err));
  }

  // -------- 4. Puzzle Sheets --------
  try {
    const out = path.join(pdfDir, "Puzzle_Sheets.pdf");
    console.log("🖨️  Puzzle Sheets PDF");
    await renderPdf({
      templateName: "puzzles",
      data: { ...base, puzzles: mystery.puzzles || [] },
      outFile: out,
      themeKey: "puzzles",
    });
    results.push(await fileResult("puzzles", "Puzzle_Sheets.pdf", out));
  } catch (err) {
    console.error("❌ Puzzle PDF failed:", err.message);
    results.push(failedResult("puzzles", "Puzzle_Sheets.pdf", err));
  }

  // -------- 5. Solution Guide --------
  try {
    const out = path.join(pdfDir, "Solution_Guide.pdf");
    console.log("🖨️  Solution Guide PDF");
    await renderPdf({
      templateName: "solution",
      data: {
        ...base,
        solution: mystery.solution || {},
        puzzles: mystery.puzzles || [],
      },
      outFile: out,
      themeKey: "solution",
    });
    results.push(await fileResult("solution", "Solution_Guide.pdf", out));
  } catch (err) {
    console.error("❌ Solution PDF failed:", err.message);
    results.push(failedResult("solution", "Solution_Guide.pdf", err));
  }

  // -------- 6. Player Instructions --------
  try {
    const out = path.join(pdfDir, "Player_Instructions.pdf");
    console.log("🖨️  Player Instructions PDF");
    await renderPdf({
      templateName: "instructions",
      data: {
        ...base,
        playerTimeline: mystery.playerTimeline || [],
      },
      outFile: out,
      themeKey: "instructions",
    });
    results.push(
      await fileResult("instructions", "Player_Instructions.pdf", out),
    );
  } catch (err) {
    console.error("❌ Instructions PDF failed:", err.message);
    results.push(failedResult("instructions", "Player_Instructions.pdf", err));
  }

  return { pdfDir, results };
}

module.exports = {
  buildMysteryPdfs,
  buildBaseData,
  renderPdf,
  renderTemplate,
  ensureDir,
  closeBrowser,
  PDF_THEMES,
  pickTheme,
  pickTitleSizeClass,
  badgeForKind,
  imageToDataUrl,
  EXPORTS_ROOT_ABS,
  EXPORTS_PREFIX,
  toRelativePath,
  toAbsolutePath,
};
