// backend/controllers/dfyPackController.js
const path = require("path");

// ================================================================
// 📦 DFY MYSTERY PACKS — hardcoded list
// Files are served from /public/mystery-packs/ (via express.static)
// ================================================================
const DFY_PACKS = [
  {
    id: "pack-01",
    name: "The Last Bell at Blackthorn Manor",
    zipFile: "01_The_Last_Bell_at_Blackthorn_Manor.zip",
    coverImage: "01_The_Last_Bell_at_Blackthorn_Manor.png",
    genre: "Murder Mystery",
    setting: "Victorian Manor",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    description:
      "A storm-torn night at Blackthorn Manor ends with the butler dead and every guest a suspect. Perfect for fans of classic whodunits.",
  },
  {
    id: "pack-02",
    name: "The Vanishing Sapphire",
    zipFile: "02_The_Vanishing_Sapphire.zip",
    coverImage: "02_The_Vanishing_Sapphire.png",
    genre: "Heist Mystery",
    setting: "Museum Gala",
    difficulty: "Easy",
    playerCount: "4-6",
    duration: 60,
    description:
      "A priceless sapphire disappears from a locked display case during a gala. The thief is still in the room.",
  },
  {
    id: "pack-03",
    name: "Midnight on the Aurelia Express",
    zipFile: "03_Midnight_on_the_Aurelia_Express.zip",
    coverImage: "03_Midnight_on_the_Aurelia_Express.png",
    genre: "Murder Mystery",
    setting: "Luxury Train",
    difficulty: "Medium",
    playerCount: "6-8",
    duration: 90,
    description:
      "A lavish cross-continental train, twelve passengers, and one body found in the dining car at midnight.",
  },
  {
    id: "pack-04",
    name: "The Lighthouse That Lied",
    zipFile: "04_The_Lighthouse_That_Lied.zip",
    coverImage: "04_The_Lighthouse_That_Lied.png",
    genre: "Isolation Mystery",
    setting: "Remote Lighthouse",
    difficulty: "Hard",
    playerCount: "4-6",
    duration: 75,
    description:
      "A lighthouse keeper is dead, the beacon was dark for two hours, and someone on this tiny island is lying.",
  },
  {
    id: "pack-05",
    name: "The Silent Orbit",
    zipFile: "05_The_Silent_Orbit.zip",
    coverImage: "05_The_Silent_Orbit.png",
    genre: "Sci-Fi Mystery",
    setting: "Space Station",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    description:
      "The commander of a deep-space station is found dead in a sealed module. The oxygen was fine — but the crew wasn't alone.",
  },
  {
    id: "pack-06",
    name: "The Clockmaker's Missing Hour",
    zipFile: "06_The_Clockmaker_s_Missing_Hour.zip",
    coverImage: "06_The_Clockmaker_s_Missing_Hour.png",
    genre: "Detective Mystery",
    setting: "Clockmaker's Workshop",
    difficulty: "Medium",
    playerCount: "4-6",
    duration: 60,
    description:
      "At 11 PM, the town clock stopped. At 12, the clockmaker was dead. Nothing about the past hour adds up.",
  },
  {
    id: "pack-07",
    name: "The Pharaoh's False Seal",
    zipFile: "07_The_Pharaoh_s_False_Seal.zip",
    coverImage: "07_The_Pharaoh_s_False_Seal.png",
    genre: "Archaeological Mystery",
    setting: "Egyptian Tomb",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    description:
      "An archaeological dig uncovers a sealed tomb — but someone has already been inside, and one of the team will kill to keep the secret.",
  },
  {
    id: "pack-08",
    name: "The Masquerade Ledger",
    zipFile: "08_The_Masquerade_Ledger.zip",
    coverImage: "08_The_Masquerade_Ledger.png",
    genre: "Mystery Thriller",
    setting: "Masquerade Ball",
    difficulty: "Medium",
    playerCount: "6-8",
    duration: 90,
    description:
      "Hidden behind masks, a crime lord falls at a masquerade. The ledger with every guest's secret has vanished.",
  },
  {
    id: "pack-09",
    name: "The Ghost Frequency",
    zipFile: "09_The_Ghost_Frequency.zip",
    coverImage: "09_The_Ghost_Frequency.png",
    genre: "Paranormal Mystery",
    setting: "Radio Station",
    difficulty: "Hard",
    playerCount: "4-6",
    duration: 75,
    description:
      "A late-night radio host picks up a signal from a station abandoned 20 years ago. Then the caller dies on air.",
  },
  {
    id: "pack-10",
    name: "The Last Recipe at Ember House",
    zipFile: "10_The_Last_Recipe_at_Ember_House.zip",
    coverImage: "10_The_Last_Recipe_at_Ember_House.png",
    genre: "Culinary Mystery",
    setting: "Restaurant Kitchen",
    difficulty: "Easy",
    playerCount: "4-6",
    duration: 60,
    description:
      "The head chef at Ember House is dead and every dish on the tasting menu could be the murder weapon.",
  },
];

// ================================================================
// 📋 LIST ALL DFY PACKS
// GET /api/dfy-packs
// ================================================================
exports.listPacks = async (req, res) => {
  try {
    const packs = DFY_PACKS.map((p) => ({
      id: p.id,
      name: p.name,
      genre: p.genre,
      setting: p.setting,
      difficulty: p.difficulty,
      playerCount: p.playerCount,
      duration: p.duration,
      description: p.description,
      // Public URLs — served via express.static
      coverUrl: `/public/mystery-packs/${p.coverImage}`,
      downloadUrl: `/api/dfy-packs/${p.id}/download`,
      fileName: p.zipFile,
    }));

    return res.json({
      success: true,
      count: packs.length,
      data: packs,
    });
  } catch (err) {
    console.error("❌ listPacks failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load DFY packs",
    });
  }
};

// ================================================================
// 📦 DOWNLOAD ONE PACK (streams the ZIP)
// GET /api/dfy-packs/:id/download
// ================================================================
exports.downloadPack = async (req, res) => {
  try {
    const { id } = req.params;
    const pack = DFY_PACKS.find((p) => p.id === id);
    if (!pack) {
      return res
        .status(404)
        .json({ success: false, message: "Pack not found" });
    }

    const zipPath = path.join(
      __dirname,
      "../public/mystery-packs",
      pack.zipFile
    );

    // Check file exists before streaming
    const fs = require("fs");
    if (!fs.existsSync(zipPath)) {
      console.error(`❌ DFY zip not found on disk: ${zipPath}`);
      return res
        .status(404)
        .json({ success: false, message: "Pack file missing on server" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pack.zipFile}"`
    );

    const stream = fs.createReadStream(zipPath);
    stream.pipe(res);
  } catch (err) {
    console.error("❌ downloadPack failed:", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: err.message || "Download failed" });
    }
  }
};
