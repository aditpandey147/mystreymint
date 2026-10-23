// frontend/src/pages/EscapeRoomAI.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  DoorOpen,
  Trash2,
  Eye,
  X,
  Lightbulb,
  Search,
  Lock,
  Key,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import escapeRoomBg from "../../assets/images/escape-room-bg.png";

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
  rose: "#ff8fa8",
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
const THEMES = [
  "Haunted Library",
  "Cyber Heist",
  "Victorian Asylum",
  "Pirate Shipwreck",
  "Alien Space Station",
  "Ancient Egyptian Tomb",
  "Abandoned Carnival",
  "Detective's Office",
  "Wizard's Tower",
];
const ERAS = [
  "1920s",
  "Victorian",
  "Modern",
  "Futuristic",
  "Medieval",
  "Post-War",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];
const PLAYER_COUNTS = ["2-4", "4-6", "6-8", "8+"];
const DURATIONS = [30, 45, 60, 75, 90];
const PUZZLE_COUNTS = [4, 5, 6];

// ================================================================
// DOWNLOAD
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
export default function EscapeRoomAI() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    theme: "Haunted Library",
    era: "1920s",
    difficulty: "Medium",
    playerCount: "4-6",
    duration: 60,
    puzzleCount: 5,
    prompt: "",
    includeImages: true,
  });

  // ================================================================
  // FETCH
  // ================================================================
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/escape-rooms");
      if (res.data?.success) setRooms(res.data.data || []);
    } catch (err) {
      console.error("Failed to load:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (generating) return;
    try {
      setGenerating(true);
      toast.loading("Building your escape room… This may take 1-3 minutes.", {
        id: "gen-escape",
      });

      const res = await api.post("/escape-rooms/generate", form, {
        timeout: 300000,
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed");

      toast.success("Escape room created!", { id: "gen-escape" });
      setRooms((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed", {
        id: "gen-escape",
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
      await api.delete(`/escape-rooms/${id}`);
      setRooms((p) => p.filter((r) => r.id !== id));
      toast.success("Escape room deleted");
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
  const filtered = rooms.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.theme?.toLowerCase().includes(q) ||
      r.setting?.toLowerCase().includes(q)
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
                minHeight: "320px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${escapeRoomBg})`,
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
                  Escape Room AI
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
                  Build Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Escape Room
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[640px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Design complete escape-room experiences — interconnected
                  puzzles, locks, keys, room visuals and a full timed solution.
                </p>

                <div className="flex flex-wrap items-center mt-6 gap-x-[26px] gap-y-[14px]">
                  {[
                    "Interconnected puzzles",
                    "Room visuals",
                    "Full solution guide",
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
                    <DoorOpen size={18} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 15, color: C.heading }}
                    >
                      Generate Escape Room
                    </h2>
                    <p style={{ fontSize: 11.5, color: C.secondary }}>
                      Configure the theme and let AI design everything
                    </p>
                  </div>
                </div>

                <Field label="Theme">
                  <select
                    value={form.theme}
                    onChange={(e) =>
                      setForm({ ...form, theme: e.target.value })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {THEMES.map((t) => (
                      <option key={t} style={optionStyle}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Era">
                    <select
                      value={form.era}
                      onChange={(e) =>
                        setForm({ ...form, era: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {ERAS.map((e) => (
                        <option key={e} style={optionStyle}>
                          {e}
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

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Players">
                    <select
                      value={form.playerCount}
                      onChange={(e) =>
                        setForm({ ...form, playerCount: e.target.value })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {PLAYER_COUNTS.map((p) => (
                        <option key={p} style={optionStyle}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Duration">
                    <select
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: Number(e.target.value) })
                      }
                      className="w-full outline-none"
                      style={fieldStyle}
                    >
                      {DURATIONS.map((d) => (
                        <option key={d} style={optionStyle}>
                          {d} min
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Number of Puzzles">
                  <select
                    value={form.puzzleCount}
                    onChange={(e) =>
                      setForm({ ...form, puzzleCount: Number(e.target.value) })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {PUZZLE_COUNTS.map((p) => (
                      <option key={p} style={optionStyle}>
                        {p} puzzles
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
                    placeholder="e.g. A cursed painting that reveals the exit when burned"
                    className="w-full outline-none resize-none"
                    style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                  />
                </Field>

                <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.includeImages}
                    onChange={(e) =>
                      setForm({ ...form, includeImages: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#F6C55D]"
                  />
                  <span style={{ fontSize: 12, color: C.secondary }}>
                    Generate AI room & puzzle images
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
                      Building Room…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Escape Room
                    </>
                  )}
                </button>

                <p
                  className="mt-3 text-center"
                  style={{ fontSize: 10.5, color: C.muted }}
                >
                  Takes 1-3 minutes — includes rooms, puzzles, and visuals
                </p>
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
                      <DoorOpen size={18} style={{ color: C.cyan }} />
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{ fontSize: 15, color: C.heading }}
                      >
                        Escape Room Library
                      </h2>
                      <p style={{ fontSize: 11.5, color: C.secondary }}>
                        {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
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
                      placeholder="Search rooms…"
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
                          height: 300,
                        }}
                      />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((r) => (
                      <EscapeCard
                        key={r.id}
                        room={r}
                        onView={() => setPreview(r)}
                        onDelete={() => handleDelete(r.id, r.title)}
                        deleting={deletingId === r.id}
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
        <EscapePreviewModal room={preview} onClose={() => setPreview(null)} />
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
        <DoorOpen size={28} style={{ color: "#F6C55D" }} />
      </div>
      <h3
        className="font-['Playfair_Display',Georgia,serif] mb-2"
        style={{ fontSize: 20, color: "#F5F5F3" }}
      >
        No escape rooms yet
      </h3>
      <p
        className="mx-auto max-w-[360px]"
        style={{ fontSize: 13, color: "#AAB3B9" }}
      >
        Choose a theme on the left and click{" "}
        <strong style={{ color: "#F6C55D" }}>Generate Escape Room</strong> to
        create your first experience.
      </p>
    </div>
  );
}

// ================================================================
// ESCAPE CARD
// ================================================================
function EscapeCard({ room, onView, onDelete, deleting }) {
  const coverImage = room.images?.rooms?.[0]?.url
    ? getImageUrl(room.images.rooms[0].url)
    : null;

  const diffColor =
    room.difficulty === "Expert"
      ? "#ff5f7e"
      : room.difficulty === "Hard"
        ? "#ff8fa8"
        : room.difficulty === "Medium"
          ? "#F6C55D"
          : "#00D4D9";

  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col transition-all hover:-translate-y-[2px]"
      style={{ background: "#0C1926", border: `1px solid #29414C` }}
    >
      {coverImage ? (
        <div
          className="relative"
          style={{
            aspectRatio: "16/10",
            background: "#000000",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <img
            src={coverImage}
            alt={room.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
          <span
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full"
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: diffColor,
              color: "#000C16",
            }}
          >
            {room.difficulty}
          </span>
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
          <DoorOpen size={36} style={{ color: "#00D4D9", opacity: 0.5 }} />
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
            {room.theme}
          </span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9.5,
              background: "rgba(0,212,217,.15)",
              border: `1px solid #00D4D955`,
              color: "#00D4D9",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {room.puzzles?.length || 0} puzzles
          </span>
        </div>

        <h3
          className="font-['Playfair_Display',Georgia,serif] font-bold truncate mb-2"
          style={{ fontSize: 15, color: "#F5F5F3" }}
          title={room.title}
        >
          {room.title}
        </h3>

        <p
          className="leading-[1.5] mb-3 line-clamp-3"
          style={{ fontSize: 11.5, color: "#AAB3B9" }}
        >
          {room.roomDescription}
        </p>

        <div
          className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3"
          style={{ fontSize: 11, color: C.muted }}
        >
          <span className="inline-flex items-center gap-1">
            <Clock size={10} /> {room.duration} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={10} /> {room.playerCount}
          </span>
        </div>

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
function EscapePreviewModal({ room, onClose }) {
  const [expandedPuzzle, setExpandedPuzzle] = useState(null);

  const roomImageMap = {};
  (room.images?.rooms || []).forEach((r) => {
    if (r.roomId && r.url) roomImageMap[r.roomId] = getImageUrl(r.url);
  });

  const puzzleImageMap = {};
  (room.images?.puzzles || []).forEach((p) => {
    if (p.puzzleId && p.url) puzzleImageMap[p.puzzleId] = getImageUrl(p.url);
  });

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
        className="relative w-full max-w-[900px] rounded-[20px] overflow-hidden max-h-[92vh] overflow-y-auto"
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

        {/* Header */}
        <div className="p-6 md:p-8 pb-4">
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
              {room.theme}
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
              {room.difficulty}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                fontSize: 11,
                color: "#AAB3B9",
                border: "1px solid #29414C",
                fontWeight: 600,
              }}
            >
              {room.duration} min
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                fontSize: 11,
                color: "#AAB3B9",
                border: "1px solid #29414C",
                fontWeight: 600,
              }}
            >
              {room.playerCount} players
            </span>
          </div>

          <h2
            className="font-['Playfair_Display',Georgia,serif] font-bold mb-2"
            style={{ fontSize: 28, color: "#F5F5F3", lineHeight: 1.2 }}
          >
            {room.title}
          </h2>

          {room.atmosphere && (
            <p
              className="italic mb-4"
              style={{ fontSize: 13, color: C.secondary }}
            >
              "{room.atmosphere}"
            </p>
          )}

          <p
            className="leading-[1.7] mb-6"
            style={{ fontSize: 14, color: C.heading }}
          >
            {room.roomDescription}
          </p>

          {/* Rooms */}
          {room.rooms?.length > 0 && (
            <div className="mb-6">
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold mb-3 flex items-center gap-2"
                style={{ fontSize: 18, color: C.gold }}
              >
                <MapPin size={16} />
                Rooms
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.rooms.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-[10px] overflow-hidden"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.input,
                    }}
                  >
                    {roomImageMap[r.id] && (
                      <div
                        className="relative"
                        style={{ aspectRatio: "16/9", background: "#000000" }}
                      >
                        <img
                          src={roomImageMap[r.id]}
                          alt={r.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div
                        className="font-bold mb-1"
                        style={{ fontSize: 13, color: C.heading }}
                      >
                        {r.name}
                      </div>
                      <p
                        style={{
                          fontSize: 11.5,
                          color: C.secondary,
                          lineHeight: 1.5,
                        }}
                      >
                        {r.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Puzzles */}
          {room.puzzles?.length > 0 && (
            <div className="mb-6">
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold mb-3 flex items-center gap-2"
                style={{ fontSize: 18, color: C.gold }}
              >
                <Key size={16} />
                Puzzles ({room.puzzles.length})
              </div>
              <div className="space-y-2">
                {room.puzzles.map((p, i) => {
                  const isExpanded = expandedPuzzle === p.id;
                  const imageUrl = puzzleImageMap[p.id];
                  return (
                    <div
                      key={p.id}
                      className="rounded-[10px] overflow-hidden"
                      style={{
                        border: `1px solid ${C.border}`,
                        background: C.input,
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedPuzzle(isExpanded ? null : p.id)
                        }
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <div
                          className="grid place-items-center shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(246,197,93,.15)",
                            border: `1px solid ${C.gold}55`,
                            color: C.gold,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {p.order || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-bold truncate"
                            style={{ fontSize: 14, color: C.heading }}
                          >
                            {p.title}
                          </div>
                          <div style={{ fontSize: 11, color: C.secondary }}>
                            {p.type}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} style={{ color: C.gold }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: C.gold }} />
                        )}
                      </button>

                      {isExpanded && (
                        <div
                          className="p-3 pt-0"
                          style={{ borderTop: `1px solid ${C.border}` }}
                        >
                          {imageUrl && (
                            <div
                              className="relative rounded-[8px] overflow-hidden mb-3"
                              style={{
                                aspectRatio: "16/9",
                                background: "#000000",
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={p.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {p.setup && (
                            <p
                              className="mb-2"
                              style={{
                                fontSize: 12.5,
                                color: C.heading,
                                lineHeight: 1.6,
                              }}
                            >
                              {p.setup}
                            </p>
                          )}

                          {p.puzzleContent && (
                            <div
                              className="mb-3 p-3 rounded-[6px] whitespace-pre-wrap"
                              style={{
                                background: "#000611",
                                border: "1px dashed #29414C",
                                fontFamily: "'Courier New', monospace",
                                fontSize: 12,
                                color: C.cyan,
                                lineHeight: 1.6,
                              }}
                            >
                              {p.puzzleContent}
                            </div>
                          )}

                          {p.hints?.length > 0 && (
                            <div
                              className="mb-3 p-2.5 rounded-[6px]"
                              style={{
                                background: "rgba(246,197,93,.08)",
                                border: "1px solid #F6C55D45",
                              }}
                            >
                              <div
                                className="flex items-center gap-1.5 mb-1.5"
                                style={{
                                  fontSize: 10,
                                  textTransform: "uppercase",
                                  letterSpacing: "1.2px",
                                  color: C.gold,
                                  fontWeight: 700,
                                }}
                              >
                                <Lightbulb size={11} /> Hints
                              </div>
                              <ol
                                style={{
                                  paddingLeft: 20,
                                  margin: 0,
                                  color: C.goldHover,
                                }}
                              >
                                {p.hints.map((h, hi) => (
                                  <li
                                    key={hi}
                                    style={{
                                      fontSize: 11.5,
                                      lineHeight: 1.5,
                                      marginBottom: 2,
                                    }}
                                  >
                                    {h}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {p.answer && (
                            <div
                              className="mb-2 p-2.5 rounded-[6px]"
                              style={{
                                background: "rgba(0,212,217,.08)",
                                border: "1px solid #00D4D955",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  textTransform: "uppercase",
                                  letterSpacing: "1.2px",
                                  color: C.cyan,
                                  fontWeight: 700,
                                  marginBottom: 3,
                                }}
                              >
                                Answer
                              </div>
                              <p
                                style={{
                                  fontSize: 12.5,
                                  color: C.heading,
                                  fontWeight: 600,
                                }}
                              >
                                {p.answer}
                              </p>
                            </div>
                          )}

                          {p.unlocks && (
                            <div
                              className="flex items-center gap-1.5"
                              style={{
                                fontSize: 11,
                                color: C.gold,
                                fontStyle: "italic",
                              }}
                            >
                              <Key size={11} /> Unlocks: {p.unlocks}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Lock */}
          {room.finalLock?.description && (
            <div className="mb-6">
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold mb-3 flex items-center gap-2"
                style={{ fontSize: 18, color: C.rose }}
              >
                <Lock size={16} />
                The Final Lock
              </div>
              <div
                className="p-4 rounded-[10px]"
                style={{
                  background: "rgba(255,95,126,.08)",
                  border: "1.5px solid rgba(255,95,126,.4)",
                }}
              >
                <p
                  className="mb-2"
                  style={{ fontSize: 13, color: C.heading, lineHeight: 1.6 }}
                >
                  {room.finalLock.description}
                </p>
                {room.finalLock.combination && (
                  <p
                    style={{
                      fontSize: 14,
                      color: C.rose,
                      fontFamily: "'Courier New', monospace",
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    🔓 {room.finalLock.combination}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Solution Walkthrough */}
          {room.solutionWalkthrough && (
            <div className="mb-4">
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold mb-2 flex items-center gap-2"
                style={{ fontSize: 18, color: C.cyan }}
              >
                Solution Walkthrough
              </div>
              <p
                className="leading-[1.7] whitespace-pre-line"
                style={{ fontSize: 13, color: C.heading }}
              >
                {room.solutionWalkthrough}
              </p>
            </div>
          )}

          {/* GM Notes */}
          {room.gameMasterNotes && (
            <div
              className="p-3 rounded-[8px]"
              style={{
                background: "rgba(0,212,217,.06)",
                border: "1px dashed #00D4D955",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                  color: C.cyan,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Game Master Notes
              </div>
              <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>
                {room.gameMasterNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
