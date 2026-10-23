// frontend/src/pages/PuzzleStudio.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Puzzle as PuzzleIcon,
  Trash2,
  Eye,
  X,
  Lightbulb,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import puzzleStudioBg from "../../assets/images/puzzle-studio-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// 🎨 THEME
// ================================================================
const C = {
  mainBg: "#000C16",
  card: "#031520",
  input: "#000611",
  gold: "#F6C55D",
  goldHover: "#FFD36D",
  darkGold: "#B77B32",
  cyan: "#00D4D9",
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

// ================================================================
// OPTIONS
// ================================================================
const PUZZLE_TYPES = [
  "Any",
  "Cipher",
  "Riddle",
  "Logic",
  "Deduction",
  "Pattern",
  "Timeline",
  "Relationship",
  "Math",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TONES = ["Serious", "Dramatic", "Playful", "Dark", "Mysterious"];
const GENRES = [
  "Murder Mystery",
  "Detective Mystery",
  "Spy Thriller",
  "Horror Mystery",
  "Sci-Fi Mystery",
  "Historical Mystery",
];

// ================================================================
// DOWNLOAD HELPER
// ================================================================
async function downloadImage(url, filename) {
  try {
    toast.loading("Downloading…", { id: "dl-img" });
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objUrl);
    toast.success("Image downloaded", { id: "dl-img" });
  } catch (err) {
    console.error(err);
    toast.error("Download failed", { id: "dl-img" });
  }
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function PuzzleStudio() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    genre: "Murder Mystery",
    setting: "Luxury Hotel",
    difficulty: "Medium",
    puzzleType: "Any",
    tone: "Serious",
    prompt: "",
    includeImage: true,
  });

  // ================================================================
  // FETCH
  // ================================================================
  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/puzzle-studio");
      if (res.data?.success) setPuzzles(res.data.data || []);
    } catch (err) {
      console.error("Failed to load:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, []);

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (generating) return;
    try {
      setGenerating(true);
      toast.loading("Crafting your puzzle…", { id: "gen-puzzle" });

      const res = await api.post("/puzzle-studio/generate", form, {
        timeout: 120000,
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed");

      toast.success("Puzzle created!", { id: "gen-puzzle" });
      setPuzzles((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed", {
        id: "gen-puzzle",
      });
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // DELETE
  // ================================================================
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/puzzle-studio/${id}`);
      setPuzzles((p) => p.filter((x) => x.id !== id));
      toast.success("Puzzle deleted");
      if (preview?.id === id) setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // ================================================================
  // FILTER
  // ================================================================
  const filtered = puzzles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.question?.toLowerCase().includes(q)
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
            <section
              className="rounded-[12px] overflow-hidden relative mb-5"
              style={{
                background: "#000000",
                paddingTop: "52px",
                paddingBottom: "52px",
                paddingLeft: "30px",
                paddingRight: "30px",
                minHeight: "300px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${puzzleStudioBg})`,
                }}
              />

              {/* ===== DARK GRADIENT OVERLAY ===== */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.35)_82%,rgba(0,0,0,.15)_100%)]" />

              {/* ===== SOFT BOTTOM FADE ===== */}
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.45))]" />

              {/* ===== CONTENT ===== */}
              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 mb-3 px-[14px] py-[6px] rounded-full"
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
                  AI Puzzle Studio
                </div>

                <h1
                  className="font-['Playfair_Display',Georgia,serif] mb-3"
                  style={{
                    fontSize: "clamp(30px, 5vw, 50px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    color: "#ffffff",
                    maxWidth: 620,
                  }}
                >
                  Design Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Puzzles
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Generate ciphers, riddles, logic grids and deduction
                  challenges — each with hints, answers and explanations.
                </p>

                <div className="flex flex-wrap items-center mt-6 gap-x-[26px] gap-y-[14px]">
                  {[
                    "8 puzzle types",
                    "3 difficulty levels",
                    "AI-generated visuals",
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
              {/* ===== LEFT — GENERATOR ===== */}
              <section
                className="rounded-[12px] p-5"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
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
                    <PuzzleIcon size={18} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 15, color: C.heading }}
                    >
                      Generate Puzzle
                    </h2>
                    <p style={{ fontSize: 11.5, color: C.secondary }}>
                      Configure the puzzle and let AI design it
                    </p>
                  </div>
                </div>

                <Field label="Genre">
                  <select
                    value={form.genre}
                    onChange={(e) =>
                      setForm({ ...form, genre: e.target.value })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {GENRES.map((g) => (
                      <option key={g} style={optionStyle}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Setting">
                  <input
                    value={form.setting}
                    onChange={(e) =>
                      setForm({ ...form, setting: e.target.value })
                    }
                    placeholder="e.g. Luxury Hotel"
                    className="w-full outline-none"
                    style={fieldStyle}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Puzzle Type">
                    <select
                      value={form.puzzleType}
                      onChange={(e) =>
                        setForm({ ...form, puzzleType: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {PUZZLE_TYPES.map((t) => (
                        <option key={t} style={optionStyle}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Difficulty">
                    <select
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm({ ...form, difficulty: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} style={optionStyle}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Tone">
                  <select
                    value={form.tone}
                    onChange={(e) => setForm({ ...form, tone: e.target.value })}
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {TONES.map((t) => (
                      <option key={t} style={optionStyle}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Extra Prompt (optional)">
                  <textarea
                    value={form.prompt}
                    onChange={(e) =>
                      setForm({ ...form, prompt: e.target.value })
                    }
                    rows={3}
                    placeholder="e.g. A cipher hidden inside a hotel receipt"
                    className="w-full outline-none resize-none"
                    style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                  />
                </Field>

                <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.includeImage}
                    onChange={(e) =>
                      setForm({ ...form, includeImage: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#F6C55D]"
                  />
                  <span style={{ fontSize: 12, color: C.secondary }}>
                    Generate AI image
                  </span>
                </label>

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
                      Generate Puzzle
                    </>
                  )}
                </button>
              </section>

              {/* ===== RIGHT — LIBRARY ===== */}
              <section
                className="rounded-[12px] p-5 min-w-0"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
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
                        border: `1px solid ${C.cyan}55`,
                      }}
                    >
                      <PuzzleIcon size={18} style={{ color: C.cyan }} />
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{ fontSize: 15, color: C.heading }}
                      >
                        Puzzle Library
                      </h2>
                      <p style={{ fontSize: 11.5, color: C.secondary }}>
                        {puzzles.length}{" "}
                        {puzzles.length === 1 ? "puzzle" : "puzzles"}
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
                      placeholder="Search puzzles…"
                      className="w-full outline-none"
                      style={{ ...fieldStyle, paddingLeft: 36, height: 40 }}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-[10px]"
                        style={{
                          background: "#0C1926",
                          border: `1px solid ${C.border}`,
                          height: 260,
                        }}
                      />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((p) => (
                      <PuzzleCard
                        key={p.id}
                        puzzle={p}
                        onView={() => setPreview(p)}
                        onDelete={() => handleDelete(p.id, p.title)}
                        deleting={deletingId === p.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {preview && (
        <PreviewModal puzzle={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

// ================================================================
// STYLES
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

const optionStyle = { background: "#031520", color: "#F5F5F3" };

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label
        className="block mb-1.5 text-[12px] font-semibold"
        style={{ color: "#F5F5F3" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div
        className="grid place-items-center mx-auto mb-4"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(246,197,93,.1)",
          border: `1px solid #F6C55D55`,
        }}
      >
        <PuzzleIcon size={28} style={{ color: "#F6C55D" }} />
      </div>
      <h3
        className="font-['Playfair_Display',Georgia,serif] mb-2"
        style={{ fontSize: 20, color: "#F5F5F3" }}
      >
        No puzzles yet
      </h3>
      <p
        className="mx-auto max-w-[360px]"
        style={{ fontSize: 13, color: "#AAB3B9" }}
      >
        Fill in the form on the left and click{" "}
        <strong style={{ color: "#F6C55D" }}>Generate Puzzle</strong> to build
        your first one.
      </p>
    </div>
  );
}

// ================================================================
// PUZZLE CARD
// ================================================================
function PuzzleCard({ puzzle, onView, onDelete, deleting }) {
  const diffColor =
    puzzle.difficulty === "Hard"
      ? "#ff8fa8"
      : puzzle.difficulty === "Medium"
        ? "#F6C55D"
        : "#00D4D9";

  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col transition-all hover:-translate-y-[2px]"
      style={{ background: "#0C1926", border: `1px solid #29414C` }}
    >
      {puzzle.imageUrl ? (
        <div
          className="relative"
          style={{
            aspectRatio: "16/10",
            background: "#000000",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <img
            src={getImageUrl(puzzle.imageUrl)}
            alt={puzzle.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      ) : (
        <div
          className="grid place-items-center"
          style={{
            height: 140,
            background: "rgba(0,212,217,.06)",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <PuzzleIcon size={36} style={{ color: "#00D4D9", opacity: 0.5 }} />
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center flex-wrap gap-1.5 mb-2">
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9.5,
              background: "rgba(246,197,93,.15)",
              border: `1px solid #F6C55D55`,
              color: "#F6C55D",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {puzzle.type}
          </span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9.5,
              background: "transparent",
              border: `1px solid ${diffColor}`,
              color: diffColor,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {puzzle.difficulty}
          </span>
        </div>

        <h3
          className="font-['Playfair_Display',Georgia,serif] font-bold truncate mb-2"
          style={{ fontSize: 15, color: "#F5F5F3" }}
          title={puzzle.title}
        >
          {puzzle.title}
        </h3>

        <p
          className="leading-[1.5] mb-3 line-clamp-3"
          style={{ fontSize: 11.5, color: "#AAB3B9" }}
        >
          {puzzle.question}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 h-[34px] rounded-[8px] text-[12px] font-bold"
            style={{
              background: "#F6C55D",
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
            className="grid place-items-center w-[34px] h-[34px] rounded-[8px] disabled:opacity-40"
            style={{
              background: "#000611",
              border: "1px solid #29414C",
              color: "#ff8fa8",
            }}
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
function PreviewModal({ puzzle, onClose }) {
  const imageUrl = puzzle.imageUrl ? getImageUrl(puzzle.imageUrl) : null;
  const [showAnswer, setShowAnswer] = useState(false);

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
        className="relative w-full max-w-[760px] rounded-[20px] overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "#031520",
          border: "1px solid #29414C",
          boxShadow: "0 30px 100px rgba(0,0,0,.8)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid place-items-center w-9 h-9 rounded-full"
          style={{
            background: "rgba(0,12,22,.9)",
            border: "1px solid #29414C",
            color: "#AAB3B9",
          }}
        >
          <X size={16} />
        </button>

        {imageUrl && (
          <div
            className="relative"
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "#000000",
              borderBottom: "1px solid #29414C",
            }}
          >
            <img
              src={imageUrl}
              alt={puzzle.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                background: "rgba(246,197,93,.12)",
                border: "1px solid #F6C55D55",
                fontSize: 11,
                color: "#FFD36D",
                fontWeight: 600,
              }}
            >
              {puzzle.type}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                fontSize: 11,
                color: "#00D4D9",
                border: "1px solid #00D4D955",
                fontWeight: 600,
              }}
            >
              {puzzle.difficulty}
            </span>
          </div>

          <h2
            className="font-['Playfair_Display',Georgia,serif] font-bold mb-3"
            style={{ fontSize: 26, color: "#F5F5F3", lineHeight: 1.2 }}
          >
            {puzzle.title}
          </h2>

          <p
            className="leading-[1.7] mb-4"
            style={{ fontSize: 14, color: "#F5F5F3" }}
          >
            {puzzle.question}
          </p>

          {/* Puzzle data — rendered as formatted block */}
          {puzzle.puzzleData && Object.keys(puzzle.puzzleData).length > 0 && (
            <div
              className="mb-4 p-4 rounded-[8px] whitespace-pre-wrap"
              style={{
                background: "#000611",
                border: "1px dashed #29414C",
                fontFamily: "'Courier New', monospace",
                fontSize: 12.5,
                color: "#00D4D9",
                lineHeight: 1.7,
              }}
            >
              {Object.entries(puzzle.puzzleData).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      color: "#707F88",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                    }}
                  >
                    {k}:
                  </span>{" "}
                  {typeof v === "object"
                    ? JSON.stringify(v, null, 2)
                    : String(v)}
                </div>
              ))}
            </div>
          )}

          {puzzle.hints?.length > 0 && (
            <div
              className="mb-4 p-3 rounded-[8px]"
              style={{
                background: "rgba(246,197,93,.08)",
                border: "1px solid #F6C55D45",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                  color: "#F6C55D",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Hints
              </div>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {puzzle.hints.map((h, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 12.5,
                      color: "#FFD36D",
                      lineHeight: 1.6,
                      marginBottom: 4,
                    }}
                  >
                    {h}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAnswer((s) => !s)}
            className="w-full mb-4 flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-bold"
            style={{
              background: "transparent",
              border: "1px solid #00D4D9",
              color: "#00D4D9",
            }}
          >
            {showAnswer ? "Hide Answer" : "Reveal Answer"}
          </button>

          {showAnswer && (
            <>
              <div
                className="mb-3 p-3 rounded-[8px]"
                style={{
                  background: "rgba(0,212,217,.08)",
                  border: "1px solid #00D4D955",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "1.4px",
                    color: "#00D4D9",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Answer
                </div>
                <p
                  style={{ fontSize: 13.5, color: "#F5F5F3", fontWeight: 600 }}
                >
                  {puzzle.answer}
                </p>
              </div>

              {puzzle.explanation && (
                <div
                  className="p-3 rounded-[8px]"
                  style={{
                    background: "rgba(0,212,217,.04)",
                    border: "1px dashed #00D4D955",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1.4px",
                      color: "#00D4D9",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    Explanation
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#AAB3B9",
                      lineHeight: 1.65,
                    }}
                  >
                    {puzzle.explanation}
                  </p>
                </div>
              )}
            </>
          )}

          {imageUrl && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => downloadImage(imageUrl, `${puzzle.title}.png`)}
                className="flex items-center gap-2 h-[42px] px-4 rounded-[10px] text-[13px] font-bold"
                style={{
                  background: "#F6C55D",
                  color: "#000C16",
                  border: "1px solid #FFD36D",
                }}
              >
                <ImageIcon size={14} />
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
