// frontend/src/pages/CharacterStudio.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import characterStudioBg from "../../assets/images/character-studio-bg.png";
import {
  Sparkles,
  Loader2,
  User,
  Users,
  Wand2,
  Trash2,
  Download,
  Plus,
  Search,
  Lock,
  Eye,
  X,
  AlertCircle,
  UserPlus,
  Briefcase,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// 🎨 THEME
// ================================================================
const C = {
  mainBg: "#000C16",
  sidebar: "#00101A",
  card: "#031520",
  cardSecondary: "#0C1926",
  input: "#000611",
  gold: "#F6C55D",
  goldHover: "#FFD36D",
  darkGold: "#B77B32",
  turquoise: "#00D4D9",
  heading: "#F5F5F3",
  secondary: "#AAB3B9",
  muted: "#707F88",
  border: "#29414C",
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${clean}`;
};

const ROLES = [
  "Suspect",
  "Detective",
  "Victim",
  "Witness",
  "Accomplice",
  "Mastermind",
];
const GENRES = [
  "Murder Mystery",
  "Detective Mystery",
  "Spy Thriller",
  "Horror Mystery",
  "Sci-Fi Mystery",
  "Historical Mystery",
];
const ERAS = [
  "1920s",
  "Victorian",
  "Modern",
  "Futuristic",
  "Medieval",
  "Post-War",
];
const TONES = [
  "Serious",
  "Dramatic",
  "Mysterious",
  "Charming",
  "Cold",
  "Eccentric",
];
const AGE_RANGES = ["20-30", "30-40", "40-50", "50-60", "60+"];
const GENDERS = ["Any", "Male", "Female", "Non-binary"];

// ================================================================
// 📥 DOWNLOAD HELPER
// ================================================================
async function downloadImage(url, filename) {
  try {
    toast.loading("Downloading…", { id: "dl-img" });

    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);

    toast.success("Image downloaded", { id: "dl-img" });
  } catch (err) {
    console.error("Download failed:", err);
    toast.error("Download failed", { id: "dl-img" });
  }
}

function downloadCharacterJSON(char) {
  try {
    const clean = {
      name: char.name,
      age: char.age,
      role: char.role,
      occupation: char.occupation,
      personality: char.personality,
      background: char.background,
      motive: char.motive,
      alibi: char.alibi,
      publicInformation: char.publicInformation,
      privateInformation: char.privateInformation,
      portraitPrompt: char.portraitPrompt,
      portraitUrl: char.portraitUrl,
    };
    const dataStr = JSON.stringify(clean, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${char.name.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Character JSON downloaded");
  } catch (err) {
    toast.error("Failed to download JSON");
  }
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function CharacterStudio() {
  const navigate = useNavigate();

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [previewChar, setPreviewChar] = useState(null);

  // Form state
  const [form, setForm] = useState({
    role: "Suspect",
    genre: "Murder Mystery",
    setting: "Luxury Hotel",
    era: "1920s",
    tone: "Serious",
    ageRange: "30-40",
    gender: "Any",
    prompt: "",
    includePortrait: true,
  });

  const [deletingId, setDeletingId] = useState(null);

  // ================================================================
  // FETCH
  // ================================================================
  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const res = await api.get("/characters");
      if (res.data?.success) {
        setCharacters(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load characters:", err);
      toast.error(err.response?.data?.message || "Failed to load characters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      toast.loading("Crafting your character…", { id: "gen-char" });

      const res = await api.post("/characters/generate", form, {
        timeout: 120000,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Generation failed");
      }

      toast.success("Character created!", { id: "gen-char" });
      setCharacters((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Generate failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate character",
        { id: "gen-char" },
      );
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // DELETE
  // ================================================================
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/characters/${id}`);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      toast.success("Character deleted");
      if (previewChar?.id === id) setPreviewChar(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = characters.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.occupation?.toLowerCase().includes(q)
    );
  });

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div
      className="flex min-h-screen"
      style={{ background: C.mainBg, color: C.heading }}
    >
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1650px] mx-auto px-5 py-5">
            {/* HERO */}
            {/* HERO — with background image + increased height */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-5"
              style={{
                background: "#000000",
                paddingTop: "52px",
                paddingBottom: "52px",
                paddingLeft: "30px",
                paddingRight: "30px",
                minHeight: "310px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${characterStudioBg})`,
                }}
              />

              {/* ===== DARK GRADIENT OVERLAY ===== */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.35)_82%,rgba(0,0,0,.15)_100%)]" />

              {/* ===== SOFT BOTTOM FADE ===== */}
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.45))]" />

              {/* ===== CONTENT ===== */}
              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 mb-4 px-[14px] py-[6px] rounded-full"
                  style={{
                    background: "rgba(246,197,93,.12)",
                    border: `1px solid ${C.gold}55`,
                    color: C.gold,
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{
                      background: C.gold,
                      boxShadow: `0 0 8px ${C.gold}`,
                    }}
                  />
                  Character Studio
                </div>

                <h1
                  className="font-['Playfair_Display',Georgia,serif] mb-3"
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    color: "#ffffff",
                    maxWidth: 620,
                  }}
                >
                  Design Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Suspects
                  </em>
                </h1>

                <p
                  className="leading-[26px] mb-[22px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px,1.6vw,17px)",
                    color: C.heading,
                  }}
                >
                  Generate deeply detailed characters — backgrounds, motives,
                  secrets and cinematic portraits — for any mystery.
                </p>

                <div className="flex flex-wrap items-center mt-6 gap-x-[26px] gap-y-[14px]">
                  {[
                    "AI-generated portraits",
                    "Deep backstories",
                    "Ready to use",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[12.5px]"
                      style={{ color: C.heading }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill={C.gold}
                        aria-hidden="true"
                      >
                        <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-1 14.4L4.6 10l1.4-1.4 3 3 6-6L16.4 7 9 14.4z" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
              {/* ============= LEFT — GENERATOR ============= */}
              <section
                className="rounded-[12px] p-5"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="grid place-items-center"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(246,197,93,.12)",
                      border: `1px solid ${C.gold}55`,
                    }}
                  >
                    <Wand2 size={18} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 15, color: C.heading }}
                    >
                      Generate Character
                    </h2>
                    <p style={{ fontSize: 11.5, color: C.secondary }}>
                      Fill in the details and let AI craft a full profile
                    </p>
                  </div>
                </div>

                {/* Role */}
                <label
                  className="block mb-1.5 text-[12px] font-semibold"
                  style={{ color: C.heading }}
                >
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full outline-none mb-3"
                  style={fieldStyle}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} style={optionStyle}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Genre */}
                <label
                  className="block mb-1.5 text-[12px] font-semibold"
                  style={{ color: C.heading }}
                >
                  Genre
                </label>
                <select
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full outline-none mb-3"
                  style={fieldStyle}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g} style={optionStyle}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* Setting */}
                <label
                  className="block mb-1.5 text-[12px] font-semibold"
                  style={{ color: C.heading }}
                >
                  Setting
                </label>
                <input
                  type="text"
                  value={form.setting}
                  onChange={(e) =>
                    setForm({ ...form, setting: e.target.value })
                  }
                  placeholder="e.g. Luxury Hotel, Cruise Ship"
                  className="w-full outline-none mb-3"
                  style={fieldStyle}
                />

                {/* Era + Age */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label
                      className="block mb-1.5 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Era
                    </label>
                    <select
                      value={form.era}
                      onChange={(e) =>
                        setForm({ ...form, era: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {ERAS.map((e) => (
                        <option key={e} value={e} style={optionStyle}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block mb-1.5 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Age
                    </label>
                    <select
                      value={form.ageRange}
                      onChange={(e) =>
                        setForm({ ...form, ageRange: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {AGE_RANGES.map((a) => (
                        <option key={a} value={a} style={optionStyle}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tone + Gender */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label
                      className="block mb-1.5 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Tone
                    </label>
                    <select
                      value={form.tone}
                      onChange={(e) =>
                        setForm({ ...form, tone: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t} style={optionStyle}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block mb-1.5 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g} style={optionStyle}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prompt */}
                <label
                  className="block mb-1.5 text-[12px] font-semibold"
                  style={{ color: C.heading }}
                >
                  Extra Prompt (optional)
                </label>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="e.g. A former spy hiding in plain sight…"
                  rows={3}
                  className="w-full outline-none resize-none mb-3"
                  style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                />

                {/* Include Portrait */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.includePortrait}
                    onChange={(e) =>
                      setForm({ ...form, includePortrait: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#F6C55D]"
                  />
                  <span style={{ fontSize: 12, color: C.secondary }}>
                    Generate AI portrait
                  </span>
                </label>

                {/* Generate */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 rounded-[10px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    height: 50,
                    background: C.goldGradient,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                    fontSize: 14,
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Character
                    </>
                  )}
                </button>

                <p
                  className="mt-3 text-center"
                  style={{ fontSize: 10.5, color: C.muted }}
                >
                  Takes 15-30 seconds — includes portrait if enabled
                </p>
              </section>

              {/* ============= RIGHT — LIBRARY ============= */}
              <section
                className="rounded-[12px] p-5 min-w-0"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid place-items-center"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "rgba(0,212,217,.12)",
                        border: `1px solid ${C.turquoise}55`,
                      }}
                    >
                      <Users size={18} style={{ color: C.turquoise }} />
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{ fontSize: 15, color: C.heading }}
                      >
                        Character Library
                      </h2>
                      <p style={{ fontSize: 11.5, color: C.secondary }}>
                        {characters.length}{" "}
                        {characters.length === 1 ? "character" : "characters"}
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-[260px]">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: C.gold }}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search characters…"
                      className="w-full outline-none"
                      style={{
                        ...fieldStyle,
                        paddingLeft: 36,
                        height: 40,
                      }}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-[10px]"
                        style={{
                          background: C.cardSecondary,
                          border: `1px solid ${C.border}`,
                          height: 340,
                        }}
                      />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <div
                      className="grid place-items-center mx-auto mb-4"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "rgba(246,197,93,.1)",
                        border: `1px solid ${C.gold}55`,
                      }}
                    >
                      <UserPlus size={28} style={{ color: C.gold }} />
                    </div>
                    <h3
                      className="font-['Playfair_Display',Georgia,serif] mb-2"
                      style={{ fontSize: 20, color: C.heading }}
                    >
                      No characters yet
                    </h3>
                    <p
                      className="mx-auto max-w-[360px]"
                      style={{ fontSize: 13, color: C.secondary }}
                    >
                      Fill in the form on the left and click{" "}
                      <strong style={{ color: C.gold }}>
                        Generate Character
                      </strong>{" "}
                      to build your first suspect.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c) => (
                      <CharacterCard
                        key={c.id}
                        char={c}
                        onView={() => setPreviewChar(c)}
                        onDelete={() => handleDelete(c.id, c.name)}
                        deleting={deletingId === c.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ============ PREVIEW MODAL ============ */}
      {previewChar && (
        <CharacterPreviewModal
          char={previewChar}
          onClose={() => setPreviewChar(null)}
        />
      )}
    </div>
  );
}

// ================================================================
// SHARED STYLES
// ================================================================
const fieldStyle = {
  height: 40,
  border: `1px solid #29414C`,
  background: "#000611",
  borderRadius: 8,
  color: "#F5F5F3",
  padding: "0 12px",
  fontSize: 12.5,
};

const optionStyle = {
  background: "#031520",
  color: "#F5F5F3",
};

// ================================================================
// CHARACTER CARD
// ================================================================
function CharacterCard({ char, onView, onDelete, deleting }) {
  const portrait = char.portraitUrl ? getImageUrl(char.portraitUrl) : null;
  const fileName = `${char.name.replace(/\s+/g, "_")}.png`;

  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col transition-all hover:-translate-y-[2px]"
      style={{
        background: "#0C1926",
        border: `1px solid #29414C`,
      }}
    >
      {/* Portrait — aspect ratio 3:4, object-contain */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "3 / 4",
          background: "radial-gradient(circle at 50% 40%, #0a1a28, #000000)",
          borderBottom: `1px solid #29414C`,
          overflow: "hidden",
        }}
      >
        {portrait ? (
          <img
            src={portrait}
            alt={char.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: "center top",
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="grid place-items-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(246,197,93,.1)",
                border: "1px solid rgba(246,197,93,.3)",
              }}
            >
              <User size={36} style={{ color: "#F6C55D", opacity: 0.7 }} />
            </div>
          </div>
        )}

        {/* Role badge */}
        <span
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            background: "rgba(246,197,93,.9)",
            color: "#000C16",
            boxShadow: "0 2px 8px rgba(0,0,0,.4)",
          }}
        >
          {char.role}
        </span>

        {/* Download overlay button (only when portrait exists) */}
        {portrait && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(portrait, fileName);
            }}
            className="absolute bottom-2 right-2 grid place-items-center rounded-[8px] transition-all hover:scale-110"
            style={{
              width: 32,
              height: 32,
              background: "rgba(0,12,22,.85)",
              border: "1px solid rgba(246,197,93,.6)",
              color: "#F6C55D",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer",
            }}
            aria-label="Download portrait"
            title="Download portrait"
          >
            <Download size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="font-['Playfair_Display',Georgia,serif] font-bold truncate mb-1"
          style={{ fontSize: 15, color: "#F5F5F3" }}
          title={char.name}
        >
          {char.name}
        </h3>

        <div
          className="flex items-center flex-wrap gap-2 mb-2"
          style={{ fontSize: 11, color: "#AAB3B9" }}
        >
          <span className="inline-flex items-center gap-1">
            <User size={10} /> {char.age}
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <Briefcase size={10} /> {char.occupation}
          </span>
        </div>

        <p
          className="leading-[1.5] mb-3 line-clamp-2"
          style={{ fontSize: 11.5, color: "#AAB3B9" }}
        >
          {char.personality || char.background}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 h-[34px] rounded-[8px] text-[12px] font-bold transition-all"
            style={{
              background:
                "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
              color: "#000C16",
              border: "1px solid #FFD36D",
            }}
          >
            <Eye size={13} />
            View
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="grid place-items-center w-[34px] h-[34px] rounded-[8px] transition-colors disabled:opacity-40"
            style={{
              background: "#000611",
              border: `1px solid #29414C`,
              color: "#ff8fa8",
            }}
            aria-label="Delete character"
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PREVIEW MODAL
// ================================================================
function CharacterPreviewModal({ char, onClose }) {
  const portrait = char.portraitUrl ? getImageUrl(char.portraitUrl) : null;
  const fileName = `${char.name.replace(/\s+/g, "_")}.png`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,12,22,.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[860px] rounded-[20px] overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "#031520",
          border: `1px solid #29414C`,
          boxShadow: "0 30px 100px rgba(0,0,0,.8)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid place-items-center w-9 h-9 rounded-full transition-colors"
          style={{
            background: "rgba(0,12,22,.9)",
            border: `1px solid #29414C`,
            color: "#AAB3B9",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[340px_1fr]">
          {/* Portrait — properly proportioned */}
          <div
            className="relative"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #0a1a28, #000000)",
              minHeight: 400,
              borderRight: "1px solid #29414C",
            }}
          >
            {portrait ? (
              <img
                src={portrait}
                alt={char.name}
                className="absolute inset-0 w-full h-full"
                style={{
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <User size={96} style={{ color: "#F6C55D", opacity: 0.4 }} />
              </div>
            )}

            {/* Download portrait button */}
            {portrait && (
              <button
                type="button"
                onClick={() => downloadImage(portrait, fileName)}
                className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12px] font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(0,12,22,.9)",
                  border: "1px solid #F6C55D",
                  color: "#F6C55D",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,.5)",
                }}
              >
                <ImageIcon size={14} />
                Download Portrait
              </button>
            )}
          </div>

          {/* Info */}
          <div className="p-6 md:p-8">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-2"
              style={{
                background: "rgba(246,197,93,.12)",
                border: "1px solid #F6C55D55",
                fontSize: 11,
                color: "#FFD36D",
                fontWeight: 600,
              }}
            >
              {char.role}
            </div>

            <h2
              className="font-['Playfair_Display',Georgia,serif] font-bold mb-1"
              style={{ fontSize: 28, color: "#F5F5F3", lineHeight: 1.15 }}
            >
              {char.name}
            </h2>
            <p style={{ fontSize: 13, color: "#AAB3B9" }} className="mb-5">
              {char.age} • {char.occupation}
            </p>

            <div className="space-y-3">
              <InfoRow label="Personality" value={char.personality} />
              <InfoRow label="Background" value={char.background} />
              <InfoRow label="Motive" value={char.motive} />
              <InfoRow label="Alibi" value={char.alibi} />
              <InfoRow
                label="Appearance"
                value={char.publicInformation?.appearance}
              />
              <InfoRow
                label="Mannerisms"
                value={char.publicInformation?.mannerisms}
              />
              {char.publicInformation?.knownFacts?.length > 0 && (
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[1.4px] font-semibold mb-1"
                    style={{ color: "#707F88" }}
                  >
                    Known Facts
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {char.publicInformation.knownFacts.map((f, i) => (
                      <li key={i} style={{ fontSize: 12, color: "#AAB3B9" }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Private info */}
              <div
                className="mt-4 rounded-[10px] p-3"
                style={{
                  background: "rgba(255,95,126,.08)",
                  border: "1px solid rgba(255,95,126,.25)",
                }}
              >
                <div
                  className="flex items-center gap-1.5 mb-1.5"
                  style={{ color: "#ff8fa8", fontSize: 11, fontWeight: 700 }}
                >
                  <Lock size={11} />
                  SECRET (GM only)
                </div>
                <p style={{ fontSize: 12, color: "#ffb2c4" }}>
                  {char.privateInformation?.secret || "—"}
                </p>
              </div>
            </div>

            {/* Download full profile (JSON) */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => downloadCharacterJSON(char)}
                className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-bold transition-all hover:-translate-y-[1px]"
                style={{
                  background: "transparent",
                  color: "#F6C55D",
                  border: "1px solid #F6C55D",
                }}
              >
                <Download size={15} />
                Download Profile (JSON)
              </button>
              {portrait && (
                <button
                  type="button"
                  onClick={() => downloadImage(portrait, fileName)}
                  className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-bold transition-all hover:-translate-y-[1px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
                    color: "#000C16",
                    border: "1px solid #FFD36D",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)",
                  }}
                >
                  <ImageIcon size={15} />
                  Download Portrait
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[1.4px] font-semibold mb-0.5"
        style={{ color: "#707F88" }}
      >
        {label}
      </div>
      <p style={{ fontSize: 12.5, color: "#F5F5F3", lineHeight: 1.55 }}>
        {value}
      </p>
    </div>
  );
}
