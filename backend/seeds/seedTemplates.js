// backend/src/seeds/seedComedyTemplates.js
const path = require("path");
const fs = require("fs");

// ================================================================
// MANUAL .env LOADER
// ================================================================
const envCandidates = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p });
    console.log(`✅ Loaded env from: ${p}`);
    break;
  }
}

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("❌ No MongoDB URI found in .env");
  process.exit(1);
}

const mongoose = require("mongoose");
const Category = require("../models/Category");
const Template = require("../models/Template");

// ================================================================
// TARGET CATEGORY
// ================================================================
const CATEGORY_ID = 7; // 👈 Comedy & Entertainment

// ================================================================
// 10 COMEDY & ENTERTAINMENT TEMPLATES
// ================================================================
const comedyEntertainmentTemplates = [
  {
    title: "The Wellness Reset",
    description:
      "Explore practical ways to improve daily energy, recovery, routines and build a healthier lifestyle that lasts.",
    categoryId: 7,
    coverImage: "/public/templates/the-wellness-reset.jpg",
    dialog: {
      host: "What's the biggest mistake people make with wellness?",
      guest:
        "They chase quick fixes instead of building habits they can actually sustain.",
    },
    isTrending: true,
  },
  {
    title: "Sleep Better",
    description:
      "Discover better sleep habits, evening routines and practical ways to improve rest and recovery.",
    categoryId: 7,
    coverImage: "/public/templates/sleep-better.jpg",
    dialog: {
      host: "Why do so many people struggle to sleep well?",
      guest:
        "Because the habits before bedtime often matter more than bedtime itself.",
    },
    isTrending: true,
  },
  {
    title: "Nutrition Unfiltered",
    description:
      "Explore balanced nutrition, everyday food choices and practical approaches to healthier eating.",
    categoryId: 7,
    coverImage: "/public/templates/nutrition-unfiltered.jpg",
    dialog: {
      host: "Does healthy eating really need to be complicated?",
      guest:
        "Not at all. Consistency matters far more than chasing the perfect diet.",
    },
    isTrending: true,
  },
  {
    title: "Mind & Body Balance",
    description:
      "Explore mindfulness, stress management, emotional wellness and creating a healthier balance in everyday life.",
    categoryId: 7,
    coverImage: "/public/templates/mind-body-balance.jpg",
    dialog: {
      host: "How do you know when your mind actually needs a break?",
      guest:
        "Usually your body starts telling you long before you decide to listen.",
    },
    isTrending: true,
  },
  {
    title: "Stronger Every Day",
    description:
      "Discover sustainable approaches to strength, mobility, movement, recovery and staying consistently active.",
    categoryId: 7,
    coverImage: "/public/templates/stronger-every-day.jpg",
    dialog: {
      host: "What's more important, training harder or staying consistent?",
      guest:
        "Consistency wins because the best routine is the one you can keep doing.",
    },
    isTrending: true,
  },
  {
    title: "Healthy Aging",
    description:
      "Explore movement, recovery, healthy routines and lifestyle habits that support wellbeing throughout life.",
    categoryId: 7,
    coverImage: "/public/templates/healthy-aging.jpg",
    dialog: {
      host: "What matters most when we think about healthy aging?",
      guest:
        "Building habits today that help you stay active and connected tomorrow.",
    },
    isTrending: true,
  },
  {
    title: "Stress Less",
    description:
      "Explore practical ways to manage everyday stress, create boundaries and make more room for rest and recovery.",
    categoryId: 7,
    coverImage: "/public/templates/stress-less.jpg",
    dialog: {
      host: "Why does stress follow us even when work is finished?",
      guest:
        "Because leaving the situation doesn't always mean your mind has left it.",
    },
    isTrending: true,
  },
  {
    title: "Gut Health Conversations",
    description:
      "Explore food variety, everyday digestive wellness and the relationship between nutrition and lifestyle.",
    categoryId: 7,
    coverImage: "/public/templates/gut-health-conversations.jpg",
    dialog: {
      host: "Why has gut health become such a big conversation?",
      guest:
        "Because people are realizing how closely food and daily habits can affect how they feel.",
    },
    isTrending: true,
  },
  {
    title: "Everyday Energy",
    description:
      "Discover simple habits around movement, hydration, recovery and routines that support everyday energy.",
    categoryId: 7,
    coverImage: "/public/templates/everyday-energy.jpg",
    dialog: {
      host: "Why do people feel exhausted even after a full night's sleep?",
      guest: "Because energy depends on much more than sleep alone.",
    },
    isTrending: true,
  },
  {
    title: "Wellness Without Limits",
    description:
      "Explore a balanced approach to movement, sleep, recovery and sustainable habits for long-term wellbeing.",
    categoryId: 7,
    coverImage: "/public/templates/wellness-without-limits.jpg",
    dialog: {
      host: "What's the secret to making wellness sustainable?",
      guest:
        "Build a lifestyle you enjoy enough that healthy choices stop feeling temporary.",
    },
    isTrending: true,
  },
];

// ================================================================
// SEED — scoped to CATEGORY_ID = 2 only
// ================================================================
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // 1. Confirm category 2 exists
    const category = await Category.findOne({ id: CATEGORY_ID });
    if (!category) {
      console.error(`❌ Category id=${CATEGORY_ID} not found.`);
      console.error("   Create it first, then re-run this seed.");
      process.exit(1);
    }
    console.log(`✅ Using category: id=${category.id} (${category.name})\n`);

    // 2. Remove ONLY category-2 templates (safe re-run)
    const existing = await Template.find({ categoryId: CATEGORY_ID });
    if (existing.length > 0) {
      console.log(
        `🗑  Removing ${existing.length} existing template(s) in category ${CATEGORY_ID}...`,
      );
      await Template.deleteMany({ categoryId: CATEGORY_ID });
      console.log("   ✅ Cleared\n");
    } else {
      console.log(`📋 No existing templates in category ${CATEGORY_ID}\n`);
    }

    // 3. Find the global max template id so new templates continue from there
    const last = await Template.findOne({})
      .sort({ id: -1 })
      .select("id")
      .lean();
    let nextId = (last?.id || 0) + 1;
    console.log(`📌 Starting template id from: ${nextId}\n`);

    // 4. Insert all templates under category 2
    const created = [];
    for (const t of comedyEntertainmentTemplates) {
      const doc = await Template.create({
        id: nextId,
        categoryId: CATEGORY_ID,
        title: t.title,
        description: t.description,
        coverImage: t.coverImage,
        dialog: t.dialog,
        isTrending: t.isTrending,
      });

      created.push(doc);
      console.log(`  ✅ id=${doc.id}  "${doc.title}"`);

      nextId++;
    }

    console.log(
      `\n🎉 Inserted ${created.length} template(s) under category ${CATEGORY_ID} (${category.name})`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
