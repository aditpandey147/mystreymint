// backend/models/Mystery.js
const mongoose = require("mongoose");

// ================================================================
// SUB-SCHEMAS
// ================================================================

// ✅ Relationship objects returned by DeepSeek
const relationshipSchema = new mongoose.Schema(
  {
    with: { type: String, default: "" },
    to: { type: String, default: "" },
    from: { type: String, default: "" },
    type: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const characterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, default: 0 },
    role: { type: String, default: "" },
    occupation: { type: String, default: "" },
    personality: { type: String, default: "" },
    background: { type: String, default: "" },
    motive: { type: String, default: "" },
    alibi: { type: String, default: "" },

    // ✅ FIXED — now accepts array of objects (was [String])
    relationships: { type: [relationshipSchema], default: [] },

    isCulprit: { type: Boolean, default: false },

    publicInformation: {
      appearance: { type: String, default: "" },
      mannerisms: { type: String, default: "" },
      knownFacts: { type: [String], default: [] },
    },

    privateInformation: {
      secret: { type: String, default: "" },
      suspiciousBehavior: { type: String, default: "" },
      alibiTruth: { type: String, default: "" },
    },

    portraitPrompt: { type: String, default: "" },
    portraitUrl: { type: String, default: null },
  },
  { _id: false },
);

const clueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "Physical Evidence",
        "Testimony",
        "Document",
        "Observation",
        "Forensic",
      ],
      default: "Physical Evidence",
    },
    importance: {
      type: String,
      enum: ["Critical", "Major", "Minor"],
      default: "Major",
    },
    discoveryLocation: { type: String, default: "" },
    relatedCharacters: { type: [String], default: [] },
    relatedEvents: { type: [String], default: [] },
    supportsDeduction: { type: String, default: "" },
    isRedHerring: { type: Boolean, default: false },
    hint: { type: String, default: "" },
    imageUrl: { type: String, default: null }, // ← ADD THIS LINE
  },
  { _id: false },
);

const evidenceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "Witness Statement",
        "Letter",
        "Diary Entry",
        "Security Report",
        "Receipt",
        "Record",
        "Newspaper Article",
        "Investigation Report",
        "Photographic Evidence",
      ],
      default: "Witness Statement",
    },
    relatedCharacters: { type: [String], default: [] },
    relatedEvents: { type: [String], default: [] },
    body: { type: String, default: "" },
    imageUrl: { type: String, default: null },
  },
  { _id: false },
);

const puzzleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "Cipher",
        "Riddle",
        "Logic",
        "Deduction",
        "Pattern",
        "Timeline",
        "Relationship",
        "Math", // ← ADD (used by AI Puzzle Studio)
      ],
      default: "Riddle",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    question: { type: String, default: "" },
    puzzleData: { type: mongoose.Schema.Types.Mixed, default: {} },
    answer: { type: String, default: "" },
    explanation: { type: String, default: "" },
    hints: { type: [String], default: [] },
    relatedClueIds: { type: [String], default: [] },
    imageUrl: { type: String, default: null }, // ← ADD (the actual fix)
  },
  { _id: false },
);

const timelineEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    time: { type: String, default: "" },
    location: { type: String, default: "" },
    characters: { type: [String], default: [] },
    description: { type: String, default: "" },
    event: { type: String, default: "" },
    visibleToPlayers: { type: Boolean, default: true },
  },
  { _id: false },
);

const storyKeyEventSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const clueExplanationSchema = new mongoose.Schema(
  {
    clueId: { type: String, default: "" },
    meaning: { type: String, default: "" },
  },
  { _id: false },
);

const redHerringExplanationSchema = new mongoose.Schema(
  {
    clueId: { type: String, default: "" },
    whyMisleading: { type: String, default: "" },
  },
  { _id: false },
);

const puzzleAnswerSchema = new mongoose.Schema(
  {
    puzzleId: { type: String, default: "" },
    answer: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const characterImageSchema = new mongoose.Schema(
  {
    characterId: { type: String, default: "" },
    name: { type: String, default: "" },
    url: { type: String, default: null },
  },
  { _id: false },
);

const sceneImageSchema = new mongoose.Schema(
  {
    location: { type: String, default: "" },
    url: { type: String, default: null },
  },
  { _id: false },
);

// ================================================================
// ESCAPE ROOM SUB-SCHEMAS (for AI Escape Room Studio)
// ================================================================

const escapeRoomSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    theme: { type: String, default: "" },
    era: { type: String, default: "" },
    setting: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert"],
      default: "Medium",
    },
    playerCount: { type: String, default: "4-6" },
    duration: { type: Number, default: 60 },
    roomDescription: { type: String, default: "" },
    atmosphere: { type: String, default: "" },

    // ---------- ROOMS ----------
    rooms: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, default: "" },
            name: { type: String, default: "" },
            description: { type: String, default: "" },
            imagePrompt: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    // ---------- PUZZLES ----------
    puzzles: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, default: "" },
            order: { type: Number, default: 0 },
            title: { type: String, default: "" },
            type: { type: String, default: "" },
            roomId: { type: String, default: "" },
            setup: { type: String, default: "" },
            puzzleContent: { type: String, default: "" },
            answer: { type: String, default: "" },
            solution: { type: String, default: "" },
            unlocks: { type: String, default: "" },
            hints: { type: [String], default: [] },
            imagePrompt: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    // ---------- FINAL LOCK ----------
    finalLock: {
      description: { type: String, default: "" },
      combination: { type: String, default: "" },
      puzzleIds: { type: [String], default: [] },
    },

    // ---------- NARRATIVE ----------
    solutionWalkthrough: { type: String, default: "" },
    gameMasterNotes: { type: String, default: "" },

    // ---------- IMAGES ----------
    images: {
      rooms: {
        type: [
          new mongoose.Schema(
            {
              roomId: { type: String, default: "" },
              url: { type: String, default: null },
            },
            { _id: false }
          ),
        ],
        default: [],
      },
      puzzles: {
        type: [
          new mongoose.Schema(
            {
              puzzleId: { type: String, default: "" },
              url: { type: String, default: null },
            },
            { _id: false }
          ),
        ],
        default: [],
      },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ================================================================
// MAIN SCHEMA
// ================================================================

const mysterySchema = new mongoose.Schema(
  {
    // ---------- OWNERSHIP ----------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MysteryTemplate",
      default: null,
    },

    // ---------- USER INPUT ----------
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true },
    setting: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    playerCount: { type: String, default: "4-8" },
    duration: { type: Number, default: 60 },
    targetAudience: { type: String, default: "Adults" },
    storyIdea: { type: String, default: "" },

    // ---------- GENERATION STATUS ----------
    generationStatus: {
      type: String,
      enum: [
        "pending",
        "generating",
        "validating",
        "completed",
        "failed",
        "needs_review",
      ],
      default: "pending",
      index: true,
    },
    generationProgress: { type: Number, default: 0, min: 0, max: 100 },
    currentStage: { type: String, default: "" },
    generationError: { type: String, default: null },

    // ---------- GENERATED CONTENT ----------
    blueprint: { type: mongoose.Schema.Types.Mixed, default: null },

    story: {
      introduction: { type: String, default: "" },
      background: { type: String, default: "" },
      settingDescription: { type: String, default: "" },
      mainIncident: { type: String, default: "" },
      crimeDiscovery: { type: String, default: "" },
      investigationOpening: { type: String, default: "" },
      keyEvents: { type: [storyKeyEventSchema], default: [] },
      suspensefulDevelopments: { type: [String], default: [] },
      finalChallenge: { type: String, default: "" },
    },

    characters: { type: [characterSchema], default: [] },
    clues: { type: [clueSchema], default: [] },
    evidence: { type: [evidenceSchema], default: [] },
    puzzles: { type: [puzzleSchema], default: [] },
    rooms: { type: [escapeRoomSubSchema], default: [] },

    actualTimeline: { type: [timelineEventSchema], default: [] },
    playerTimeline: { type: [timelineEventSchema], default: [] },

    solution: {
      culprit: { type: String, default: "" },
      motive: { type: String, default: "" },
      method: { type: String, default: "" },
      fullTimelineNarrative: { type: String, default: "" },
      clueExplanations: { type: [clueExplanationSchema], default: [] },
      redHerringExplanations: {
        type: [redHerringExplanationSchema],
        default: [],
      },
      puzzleAnswers: { type: [puzzleAnswerSchema], default: [] },
      finalDeductionWalkthrough: { type: String, default: "" },
      caseConclusion: { type: String, default: "" },
    },

    validationReport: { type: mongoose.Schema.Types.Mixed, default: null },

    // ---------- IMAGES (store RELATIVE paths only) ----------
    images: {
      cover: { type: String, default: null },
      characters: { type: [characterImageSchema], default: [] },
      scenes: { type: [sceneImageSchema], default: [] },
    },

    // ---------- EXPORTS ----------
    exportIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Export",
      default: [],
    },
  },
  { timestamps: true },
);

// ================================================================
// INDEXES
// ================================================================
mysterySchema.index({ userId: 1, createdAt: -1 });
mysterySchema.index({ userId: 1, generationStatus: 1 });

// ================================================================
// METHODS
// ================================================================

// Player-safe JSON — strips culprit reveal, solution, private info
mysterySchema.methods.toPlayerJSON = function () {
  const obj = this.toObject();

  delete obj.blueprint;
  delete obj.solution;
  delete obj.validationReport;

  if (Array.isArray(obj.characters)) {
    obj.characters = obj.characters.map((c) => {
      delete c.isCulprit;
      delete c.privateInformation;
      return c;
    });
  }

  if (Array.isArray(obj.puzzles)) {
    obj.puzzles = obj.puzzles.map((p) => {
      delete p.answer;
      delete p.explanation;
      delete p.puzzleData;
      return p;
    });
  }

  if (Array.isArray(obj.clues)) {
    obj.clues = obj.clues.map((cl) => {
      delete cl.isRedHerring;
      delete cl.supportsDeduction;
      return cl;
    });
  }

  return obj;
};

module.exports = mongoose.model("Mystery", mysterySchema);
