// backend/scripts/exportTemplates.js
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Template = require("../models/Template");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/podcastai";

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const templates = await Template.find({}).lean();
    console.log(`📦 Found ${templates.length} templates`);

    // Save as JSON
    const outPath = path.join(__dirname, "../templates-export.json");
    fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));

    console.log(`✅ Exported to: ${outPath}`);

    // Also save a CSV
    const csvHeader = [
      "id",
      "categoryId",
      "title",
      "description",
      "coverImage",
      "isTrending",
      "host",
      "guest",
    ].join(",");

    const csvRows = templates.map((t) => {
      const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      return [
        t.id ?? "",
        t.categoryId ?? "",
        esc(t.title),
        esc(t.description),
        esc(t.coverImage),
        t.isTrending ?? "",
        esc(t.dialog?.host),
        esc(t.dialog?.guest),
      ].join(",");
    });

    const csvPath = path.join(__dirname, "../templates-export.csv");
    fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"));

    console.log(`✅ Exported to: ${csvPath}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();