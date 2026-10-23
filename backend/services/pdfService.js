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

// ================================================================
// 🎨 FIRST-PAGE THEMES — unique color per PDF
// Pages 2+ use the standard layout with default margins
// ================================================================
const FIRST_PAGE_THEMES = {
  story: {
    bg: "#0B1220",
    bgGradient: "linear-gradient(135deg, #0B1220 0%, #101B2E 50%, #0F172A 100%)",
    accent: "#7DD3FC",
    accentSoft: "rgba(125,211,252,.12)",
    accentBorder: "rgba(125,211,252,.4)",
    text: "#F1F5F9",
    muted: "#94A3B8",
    label: "STORY",
    title: "Mystery Story",
  },
  suspects: {
    bg: "#1A0F1E",
    bgGradient: "linear-gradient(135deg, #1A0F1E 0%, #241531 50%, #1E1120 100%)",
    accent: "#F5B942",
    accentSoft: "rgba(245,185,66,.12)",
    accentBorder: "rgba(245,185,66,.4)",
    text: "#F5F3FF",
    muted: "#C4B5D4",
    label: "CHARACTERS",
    title: "Suspect Cards",
  },
  clues: {
    bg: "#0F1A14",
    bgGradient: "linear-gradient(135deg, #0F1A14 0%, #14261C 50%, #0D2019 100%)",
    accent: "#86EFAC",
    accentSoft: "rgba(134,239,172,.10)",
    accentBorder: "rgba(134,239,172,.4)",
    text: "#ECFDF5",
    muted: "#9DBFAA",
    label: "CLUES",
    title: "Clues & Evidence",
  },
  puzzles: {
    bg: "#0B1A1F",
    bgGradient: "linear-gradient(135deg, #0B1A1F 0%, #0F2830 50%, #0B2027 100%)",
    accent: "#00D5D8",
    accentSoft: "rgba(0,213,216,.10)",
    accentBorder: "rgba(0,213,216,.4)",
    text: "#ECFEFF",
    muted: "#7FB8BC",
    label: "PUZZLES",
    title: "Puzzle Sheets",
  },
  solution: {
    bg: "#140F1E",
    bgGradient: "linear-gradient(135deg, #140F1E 0%, #1E1233 50%, #180F26 100%)",
    accent: "#A78BFA",
    accentSoft: "rgba(167,139,250,.10)",
    accentBorder: "rgba(167,139,250,.4)",
    text: "#F5F3FF",
    muted: "#B4A5D6",
    label: "SOLUTION",
    title: "Solution Guide",
  },
  instructions: {
    bg: "#1E1120",
    bgGradient: "linear-gradient(135deg, #1E1120 0%, #2A1730 50%, #221426 100%)",
    accent: "#F472B6",
    accentSoft: "rgba(244,114,182,.10)",
    accentBorder: "rgba(244,114,182,.4)",
    text: "#FDF2F8",
    muted: "#C99BB2",
    label: "GUIDE",
    title: "Player Instructions",
  },
};

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
      relativePath.replace(EXPORTS_PREFIX, "").replace(/^\//, "")
    );
  }
  if (relativePath.startsWith("/")) return relativePath;
  return path.join(EXPORTS_ROOT_ABS, relativePath);
}

// ================================================================
// 📁 ENSURE DIRECTORY
// ================================================================
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
  Handlebars.registerHelper("nl2br", (s) =>
    String(s || "").replace(/\n/g, "<br>")
  );
  Handlebars.registerHelper("year", () => new Date().getFullYear());
}

async function loadTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);
  registerHelpers();

  const file = path.join(TEMPLATES_DIR, `${name}.html`);
  const raw = await fs.readFile(file, "utf8");

  const compiled = Handlebars.compile(raw, {
    noEscape: false,
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  });

  templateCache.set(name, compiled);
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
// 🎨 THEME CSS — first page full bleed, rest normal
// ================================================================
function buildThemeCSS(theme) {
  return `
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background: #ffffff;
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* ============================================================
       FIRST PAGE — FULL BLEED, ZERO MARGIN, UNIQUE COLOR
       ============================================================ */
    .pdf-first-page {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;                       /* ← NO padding */
      background: ${theme.bg};
      background-image: ${theme.bgGradient};
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      color: ${theme.text};
    }

    /* Optional cover image behind the first page */
    .pdf-first-page .cover-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      opacity: 0.35;
    }

    .pdf-first-page .cover-overlay {
      position: absolute;
      inset: 0;
      background: ${theme.bgGradient};
      opacity: 0.9;
      z-index: 1;
    }

    /* Inner padding wrapper for content on first page.
       This adds PADDING but the page's BACKGROUND still bleeds to edges. */
    .pdf-first-page-inner {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 24mm 20mm;               /* content breathing room only */
      display: flex;
      flex-direction: column;
    }

    .first-page-eyebrow {
      font-size: 9pt;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: ${theme.accent};
      font-weight: 700;
      margin-bottom: 16px;
    }

    .first-page-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 46pt;
      line-height: 1.02;
      color: ${theme.text};
      font-weight: 700;
      margin-bottom: 20px;
    }

    .first-page-divider {
      width: 70px;
      height: 4px;
      background: ${theme.accent};
      margin-bottom: 22px;
    }

    .first-page-meta {
      font-size: 12pt;
      line-height: 1.65;
      color: ${theme.muted};
    }

    .first-page-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      letter-spacing: 2px;
      color: ${theme.muted};
      text-transform: uppercase;
    }

    /* ============================================================
       BODY PAGES (2, 3, 4...) — ORIGINAL LAYOUT, SAME MARGINS
       ============================================================ */
    .pdf-body-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 18mm 16mm;               /* ← SAME as your old margins */
      background: #ffffff;
      color: #1a1a1a;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .pdf-body-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Body pages typography (kept from original) */
    .pdf-body-page h1,
    .pdf-body-page h2,
    .pdf-body-page h3,
    .pdf-body-page h4 {
      font-family: 'Playfair Display', Georgia, serif;
      color: #0B1220;
    }

    .pdf-body-page h2 {
      font-size: 18pt;
      margin-top: 14px;
      margin-bottom: 8px;
      color: ${theme.accent};
    }

    .pdf-body-page h2:first-of-type {
      margin-top: 0;
    }

    .pdf-body-page p {
      font-size: 10.5pt;
      line-height: 1.7;
      color: #1a1a1a;
      white-space: pre-wrap;
    }

    .pdf-body-page strong {
      color: ${theme.accent};
      font-weight: 700;
    }

    .pdf-body-page .card {
      border: 1px solid #e0e0e0;
      border-left: 3px solid ${theme.accent};
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 10px;
      background: #fafafa;
    }

    .pdf-body-page .badge {
      display: inline-block;
      font-size: 7.5pt;
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      background: ${theme.accentSoft};
      color: ${theme.accent};
      border: 1px solid ${theme.accentBorder};
    }

    .pdf-body-page img {
      max-width: 100%;
      display: block;
    }

    .pdf-body-page .mono {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.65;
      white-space: pre-wrap;
    }

    .pdf-body-page .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `;
}

// ================================================================
// 🖨️ INJECT THEME CSS INTO RENDERED HTML
// ================================================================
function injectTheme(html, theme) {
  const css = buildThemeCSS(theme);
  const styleTag = `<style data-pdf-theme="true">${css}</style>`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${styleTag}</head>`);
  }
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, `$&${styleTag}`);
  }
  return `<!DOCTYPE html><html><head>${styleTag}</head><body>${html}</body></html>`;
}

// ================================================================
// 🖨️ RENDER HTML → PDF
// KEY: margin 0 at PDF level, since first page must bleed.
// Body pages simulate margins via padding.
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
    let html = await renderTemplate(templateName, data);

    const theme = FIRST_PAGE_THEMES[themeKey] || FIRST_PAGE_THEMES.story;
    html = injectTheme(html, theme);

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 90000,
    });

    // Ensure page background matches for the bleed
    await page.evaluate((bg) => {
      document.documentElement.style.background = bg;
      document.body.style.background = "#ffffff";
      document.documentElement.style.margin = "0";
      document.body.style.margin = "0";
    }, theme.bg);

    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 300));

    // CRITICAL: margin 0 everywhere so first page bleeds.
    // Body pages simulate the old margins via CSS padding.
    await page.pdf({
      path: outFile,
      format: "A4",
      landscape,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,     // ← no browser footer
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    return outFile;
  } finally {
    await page.close();
  }
}

// ================================================================
// 📄 BASE DATA BUILDER
// ================================================================
function buildBaseData(mystery) {
  const coverImage = mystery.images?.cover || "";
  const sceneImages = (mystery.images?.scenes || []).filter((s) => s.url);
  const characterPortraits = mystery.images?.characters || [];

  return {
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
// 📊 FILE RESULT HELPER
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

  const base = buildBaseData(mystery);
  const results = [];

  // -------- 1. Story — midnight blue first page --------
  try {
    const out = path.join(pdfDir, "Mystery_Story.pdf");
    console.log("🖨️  Story PDF (first-page theme: midnight blue)");
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

  // -------- 2. Suspect Cards — aubergine first page --------
  try {
    const out = path.join(pdfDir, "Suspect_Cards.pdf");
    console.log("🖨️  Suspect Cards PDF (first-page theme: aubergine)");

    const characters = (mystery.characters || []).map((c) => {
      const portrait = (mystery.images?.characters || []).find(
        (img) => img.characterId === c.id
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

  // -------- 3. Clues & Evidence — forest green first page --------
  try {
    const out = path.join(pdfDir, "Clues_and_Evidence.pdf");
    console.log("🖨️  Clues & Evidence PDF (first-page theme: forest green)");
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

  // -------- 4. Puzzle Sheets — deep teal first page --------
  try {
    const out = path.join(pdfDir, "Puzzle_Sheets.pdf");
    console.log("🖨️  Puzzle Sheets PDF (first-page theme: deep teal)");
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

  // -------- 5. Solution Guide — royal purple first page --------
  try {
    const out = path.join(pdfDir, "Solution_Guide.pdf");
    console.log("🖨️  Solution Guide PDF (first-page theme: royal purple)");
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

  // -------- 6. Player Instructions — plum first page --------
  try {
    const out = path.join(pdfDir, "Player_Instructions.pdf");
    console.log("🖨️  Player Instructions PDF (first-page theme: plum)");
    await renderPdf({
      templateName: "instructions",
      data: {
        ...base,
        playerTimeline: mystery.playerTimeline || [],
      },
      outFile: out,
      themeKey: "instructions",
    });
    results.push(await fileResult("instructions", "Player_Instructions.pdf", out));
  } catch (err) {
    console.error("❌ Instructions PDF failed:", err.message);
    results.push(failedResult("instructions", "Player_Instructions.pdf", err));
  }

  return { pdfDir, results };
}

module.exports = {
  buildMysteryPdfs,
  renderPdf,
  renderTemplate,
  ensureDir,
  closeBrowser,
  FIRST_PAGE_THEMES,
  EXPORTS_ROOT_ABS,
  EXPORTS_PREFIX,
  toRelativePath,
  toAbsolutePath,
};