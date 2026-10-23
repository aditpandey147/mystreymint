// backend/scripts/seed-templates.js
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MysteryTemplate = require("../models/MysteryTemplate");

// ================================================================
// 🌱 SEED TEMPLATES — matches the HTML reference UI
// ================================================================

const TEMPLATES = [
  {
    name: "Pharaoh's Temple of Lost Treasures",
    slug: "pharaohs-temple-of-lost-treasures",
    description:
      "An ancient Egyptian temple hides a legendary treasure. Decode forgotten symbols, uncover deadly secrets and solve the mystery of a missing explorer.",
    genre: "Treasure Hunt",
    setting: "Ancient Egyptian Temple",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "An archaeologist disappears while exploring a newly discovered Egyptian temple. A secret chamber, mysterious artifacts and an ancient warning lead investigators toward a treasure that someone will kill to protect.",
    thumbnail: "/public/mystery-templates/pharaohs-temple.png",
    tags: ["egypt", "pharaoh", "ancient", "treasure", "temple"],
    category: "Adventure",
    isFeatured: true,
    isActive: true,
    order: 1,
  },
  {
    name: "Neon Noir Detective in the Rain",
    slug: "neon-noir-detective-in-the-rain",
    description:
      "A mysterious murder shakes a neon-lit city. Follow hidden clues, dangerous criminals and a conspiracy buried beneath the streets.",
    genre: "Detective Mystery",
    setting: "Neon-Lit Modern City",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A powerful businessman is found murdered in a rain-soaked city alley. A private detective discovers that the victim was connected to a secret organization controlling the city's criminal underworld.",
    thumbnail: "/public/mystery-templates/neon-noir-detective.png",
    tags: ["detective", "noir", "city", "crime", "investigation"],
    category: "Detective",
    isFeatured: true,
    isActive: true,
    order: 2,
  },
  {
    name: "Alpine Noir at Dusk",
    slug: "alpine-noir-at-dusk",
    description:
      "A wealthy guest disappears from a remote mountain resort. Investigate suspicious visitors, hidden motives and secrets buried beneath the snow.",
    genre: "Murder Mystery",
    setting: "Luxury Alpine Mountain Resort",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "During an exclusive winter gathering at a luxury Alpine resort, a billionaire disappears without a trace. A sudden snowstorm traps every guest inside, and investigators discover evidence of a carefully planned crime.",
    thumbnail: "/public/mystery-templates/alpine-noir.png",
    tags: ["mountain", "snow", "resort", "disappearance", "luxury"],
    category: "Classic",
    isFeatured: true,
    isActive: true,
    order: 3,
  },
  {
    name: "The Detective's Secret Clue Board",
    slug: "the-detectives-secret-clue-board",
    description:
      "A detective discovers connections between several unsolved crimes. Examine photographs, secret messages and evidence to uncover the mastermind.",
    genre: "Detective Mystery",
    setting: "Private Detective Investigation Office",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A detective receives an anonymous package containing photographs, coded letters and evidence linking five mysterious disappearances. As investigators connect the clues, they realize the criminal has been watching their every move.",
    thumbnail: "/public/mystery-templates/detective-clue-board.png",
    tags: ["detective", "evidence", "clues", "conspiracy", "investigation"],
    category: "Detective",
    isFeatured: false,
    isActive: true,
    order: 4,
  },
  {
    name: "Moonlit Noir Island Resort",
    slug: "moonlit-noir-island-resort",
    description:
      "A paradise island becomes the scene of a shocking crime. Uncover hidden relationships, suspicious guests and a deadly secret.",
    genre: "Murder Mystery",
    setting: "Private Tropical Island Resort",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A luxury island resort hosts an exclusive gathering of wealthy guests. When the resort owner is discovered dead and the island's communication systems fail, everyone becomes a suspect.",
    thumbnail: "/public/mystery-templates/moonlit-island-resort.png",
    tags: ["island", "resort", "luxury", "murder", "tropical"],
    category: "Adventure",
    isFeatured: true,
    isActive: true,
    order: 5,
  },
  {
    name: "Noir Spaceport Beneath a Giant Planet",
    slug: "noir-spaceport-beneath-a-giant-planet",
    description:
      "A scientist disappears from a futuristic spaceport. Investigate advanced technology, suspicious crew members and a dangerous interplanetary conspiracy.",
    genre: "Sci-Fi Mystery",
    setting: "Futuristic Interplanetary Spaceport",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "In the year 2187, a brilliant scientist vanishes from an orbital spaceport shortly before revealing a revolutionary discovery. Security recordings have been erased, and every crew member is hiding something.",
    thumbnail: "/public/mystery-templates/noir-spaceport.png",
    tags: ["space", "science-fiction", "future", "technology", "conspiracy"],
    category: "Sci-Fi",
    isFeatured: true,
    isActive: true,
    order: 6,
  },
  {
    name: "Neon Noir Over the Thames",
    slug: "neon-noir-over-the-thames",
    description:
      "A mysterious murder near London's famous river reveals an international conspiracy involving powerful figures and hidden identities.",
    genre: "Detective Mystery",
    setting: "Futuristic London Riverside",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A confidential government informant is found murdered near the Thames. A detective discovers encrypted messages linking the victim to an international network of spies and corrupt officials.",
    thumbnail: "/public/mystery-templates/neon-thames.png",
    tags: ["london", "detective", "espionage", "conspiracy", "noir"],
    category: "Detective",
    isFeatured: false,
    isActive: true,
    order: 7,
  },
  {
    name: "Midnight Executive Skyline",
    slug: "midnight-executive-skyline",
    description:
      "A powerful billionaire vanishes from a luxury penthouse. Follow financial secrets, suspicious executives and a carefully hidden conspiracy.",
    genre: "Detective Mystery",
    setting: "Luxury Skyscraper Penthouse",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A technology billionaire disappears hours before announcing a billion-dollar merger. His penthouse is locked from the inside, his security team claims nothing happened, and several executives stand to gain from his disappearance.",
    thumbnail: "/public/mystery-templates/executive-skyline.png",
    tags: ["billionaire", "penthouse", "business", "disappearance", "city"],
    category: "Modern",
    isFeatured: true,
    isActive: true,
    order: 8,
  },
  {
    name: "The Westminster Detective",
    slug: "the-westminster-detective",
    description:
      "A mysterious death near London's historic Parliament exposes political secrets, hidden alliances and a dangerous criminal plot.",
    genre: "Detective Mystery",
    setting: "Historic Westminster London",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "A prominent political advisor is discovered dead near Westminster shortly before an important parliamentary announcement. A private investigator uncovers secret meetings, forged documents and an unexpected betrayal.",
    thumbnail: "/public/mystery-templates/detective-westminster.png",
    tags: ["westminster", "london", "politics", "detective", "historical"],
    category: "Historical",
    isFeatured: false,
    isActive: true,
    order: 9,
  },
  {
    name: "Moonlit Gothic Manor",
    slug: "moonlit-gothic-manor",
    description:
      "A mysterious inheritance brings strangers to an isolated Gothic mansion. Discover secret passages, missing family members and terrifying secrets.",
    genre: "Horror Mystery",
    setting: "Haunted Gothic Mansion",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "After the death of a wealthy aristocrat, several relatives gather at an isolated Gothic manor to hear his final will. Strange noises, disappearing objects and a hidden family secret suggest that someone inside the mansion is manipulating events.",
    thumbnail: "/public/mystery-templates/gothic-manor.png",
    tags: ["haunted", "mansion", "gothic", "inheritance", "paranormal"],
    category: "Horror",
    isFeatured: true,
    isActive: true,
    order: 10,
  },
  {
    name: "Moonlit Luxury Cruise Liner",
    slug: "moonlit-luxury-cruise-liner",
    description:
      "A billionaire is murdered aboard a luxury cruise ship. Investigate wealthy passengers, secret relationships and a deadly crime at sea.",
    genre: "Murder Mystery",
    setting: "Luxury Ocean Cruise Ship",
    difficulty: "Medium",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "During an exclusive midnight celebration aboard a luxury cruise ship, a billionaire passenger is found murdered in a private cabin. The ship is far from shore, security footage is missing, and every suspect has a hidden motive.",
    thumbnail: "/public/mystery-templates/luxury-cruise.png",
    tags: ["cruise", "ocean", "billionaire", "murder", "luxury"],
    category: "Classic",
    isFeatured: true,
    isActive: true,
    order: 11,
  },
  {
    name: "Gothic Palace Under Twilight Skies",
    slug: "gothic-palace-under-twilight-skies",
    description:
      "A grand palace hides generations of deadly secrets. Investigate a mysterious death, suspicious heirs and a forgotten family conspiracy.",
    genre: "Murder Mystery",
    setting: "Historic Gothic Royal Palace",
    difficulty: "Hard",
    playerCount: "4-8",
    duration: 90,
    targetAudience: "Adults",
    storyIdea:
      "During a prestigious gathering at a centuries-old palace, the family's patriarch is discovered murdered inside a locked chamber. Ancient documents reveal a hidden inheritance, and every member of the household has a reason to keep the truth buried.",
    thumbnail: "/public/mystery-templates/gothic-palace.png",
    tags: ["palace", "gothic", "inheritance", "historical", "murder"],
    category: "Historical",
    isFeatured: true,
    isActive: true,
    order: 12,
  },
];

// ================================================================
// 🌱 RUN SEED
// ================================================================
async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Mongo connected");

    let created = 0;
    let updated = 0;

    for (const t of TEMPLATES) {
      const existing = await MysteryTemplate.findOne({ slug: t.slug });

      if (existing) {
        await MysteryTemplate.updateOne({ _id: existing._id }, t);
        updated++;
        console.log(`♻️  Updated: ${t.name}`);
      } else {
        await MysteryTemplate.create(t);
        created++;
        console.log(`➕ Created: ${t.name}`);
      }
    }

    console.log(
      `\n🎉 Seeding complete — ${created} created, ${updated} updated`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();
