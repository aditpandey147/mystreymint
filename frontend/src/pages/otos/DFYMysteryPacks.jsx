// frontend/src/pages/DFYMysteryPacks.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Loader2,
  Package,
  Star,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import dfyPacksBg from "../../assets/images/dfy-packs-bg.png";

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

const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// MAIN PAGE
// ================================================================
export default function DFYMysteryPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("default");

  // ================================================================
  // FETCH PACKS
  // ================================================================
  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dfy-packs");
        if (res.data?.success) {
          setPacks(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load packs:", err);
        toast.error(
          err.response?.data?.message || "Failed to load mystery packs",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, []);

  // ================================================================
  // GENRE FILTERS (derived)
  // ================================================================
  const genres = useMemo(() => {
    const set = new Set();
    packs.forEach((p) => {
      if (p.genre) set.add(p.genre);
    });
    return ["All", ...Array.from(set).sort()];
  }, [packs]);

  // ================================================================
  // FILTER + SORT
  // ================================================================
  const filteredPacks = useMemo(() => {
    let list = [...packs];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.genre?.toLowerCase().includes(q) ||
          p.setting?.toLowerCase().includes(q),
      );
    }

    if (genre !== "All") {
      list = list.filter((p) => p.genre === genre);
    }

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "easy") {
      const diffOrder = { Easy: 0, Medium: 1, Hard: 2 };
      list.sort(
        (a, b) =>
          (diffOrder[a.difficulty] || 1) - (diffOrder[b.difficulty] || 1),
      );
    }

    return list;
  }, [packs, search, genre, sort]);

  // ================================================================
  // DOWNLOAD HANDLER
  // ================================================================
  const handleDownload = async (pack) => {
    if (downloading) return;
    try {
      setDownloading(pack.id);
      toast.loading("Downloading pack…", { id: `dl-${pack.id}` });

      // Use axios so auth header is included
      const res = await api.get(`/dfy-packs/${pack.id}/download`, {
        responseType: "blob",
        timeout: 300000,
      });

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pack.fileName || `${pack.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download ready!", { id: `dl-${pack.id}` });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Download failed",
        { id: `dl-${pack.id}` },
      );
    } finally {
      setDownloading(null);
    }
  };

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
            {/* ========== HERO ========== */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-5"
              style={{
                background: "#000000",
                paddingTop: "52px",
                paddingBottom: "52px",
                paddingLeft: "30px",
                paddingRight: "30px",
                minHeight: "280px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${dfyPacksBg})`,
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
                  Done-For-You Mystery Packs
                </div>

                <h1
                  className="font-['Playfair_Display',Georgia,serif] mb-3"
                  style={{
                    fontSize: "clamp(30px, 5vw, 50px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    color: "#ffffff",
                    maxWidth: 640,
                  }}
                >
                  Play{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Instantly
                  </em>
                </h1>
                <p
                  className="leading-[26px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Ten complete, ready-to-play mystery games. Print, gather your
                  guests, and start the investigation — everything is included
                  in the ZIP.
                </p>

                {!loading && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(246,197,93,.12)",
                        border: `1px solid ${C.gold}45`,
                        color: C.gold,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Package size={12} />
                      {packs.length} packs available
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(0,212,217,.12)",
                        border: `1px solid ${C.cyan}45`,
                        color: C.cyan,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Instant download
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(246,197,93,.08)",
                        border: `1px solid ${C.gold}30`,
                        color: C.secondary,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={12} />
                      Print-ready PDFs
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ========== SEARCH + FILTERS ========== */}
            <div
              className="rounded-[12px] p-4 mb-5 flex flex-wrap items-center gap-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.gold }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search packs…"
                  className="w-full outline-none"
                  style={{
                    height: 44,
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    borderRadius: 10,
                    color: C.heading,
                    padding: "0 14px 0 42px",
                    fontSize: 13.5,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.gold)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-5 h-5 rounded-full"
                    style={{ color: C.secondary }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Genre */}
              <div className="relative">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="outline-none appearance-none cursor-pointer"
                  style={{
                    height: 44,
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    borderRadius: 10,
                    color: C.heading,
                    padding: "0 36px 0 14px",
                    fontSize: 13,
                  }}
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g === "All" ? "All Genres" : g}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.gold }}
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="outline-none appearance-none cursor-pointer"
                  style={{
                    height: 44,
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    borderRadius: 10,
                    color: C.heading,
                    padding: "0 36px 0 14px",
                    fontSize: 13,
                  }}
                >
                  <option value="default">Default Order</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="easy">Easiest First</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.gold }}
                />
              </div>
            </div>

            {/* ========== GRID ========== */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[12px]"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      height: 420,
                    }}
                  />
                ))}
              </div>
            ) : filteredPacks.length === 0 ? (
              <div
                className="rounded-[12px] p-12 text-center"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <Package
                  size={40}
                  style={{
                    color: C.gold,
                    margin: "0 auto 16px",
                    opacity: 0.5,
                  }}
                />
                <h3
                  className="font-['Playfair_Display',Georgia,serif] mb-2"
                  style={{ fontSize: 22, color: C.heading }}
                >
                  No packs found
                </h3>
                <p style={{ fontSize: 13, color: C.secondary }}>
                  Try a different search or genre.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredPacks.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    downloading={downloading === pack.id}
                    onDownload={() => handleDownload(pack)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// PACK CARD — PORTRAIT cover, matches book-cover format
// ================================================================
function PackCard({ pack, downloading, onDownload }) {
  const cover = getAssetUrl(pack.coverUrl);

  const difficultyColor =
    pack.difficulty === "Hard"
      ? "#ff8fa8"
      : pack.difficulty === "Easy"
        ? C.cyan
        : C.gold;

  return (
    <div
      className="rounded-[12px] overflow-hidden flex flex-col transition-all hover:-translate-y-[3px]"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.gold;
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(246,197,93,.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* ============================================================
          PORTRAIT COVER — 3/4 aspect ratio (book-cover format)
          The image fills the full area without cropping distortion
          ============================================================ */}
      <div
        className="relative"
        style={{
          aspectRatio: "3 / 4", // ← portrait: taller than wide
          background: "radial-gradient(circle at 50% 40%, #0a1a28, #000000)",
          borderBottom: `1px solid ${C.border}`,
          overflow: "hidden",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={pack.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: "center top", // ← keeps faces/heads visible
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Package size={56} style={{ color: C.gold, opacity: 0.35 }} />
          </div>
        )}

        {/* Difficulty badge — top-left */}
        <span
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full"
          style={{
            background: "rgba(0,12,22,.85)",
            border: `1px solid ${difficultyColor}`,
            color: difficultyColor,
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".6px",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {pack.difficulty}
        </span>

        {/* Genre pill — top-right */}
        {pack.genre && (
          <span
            className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(246,197,93,.9)",
              color: "#000C16",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {pack.genre}
          </span>
        )}

        {/* Bottom gradient overlay + title inside cover */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "45%",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.75) 60%, rgba(0,0,0,.95) 100%)",
          }}
        />

        {/* Title overlaid at bottom of cover */}
        <div className="absolute inset-x-0 bottom-0 p-4" style={{ zIndex: 2 }}>
          <h3
            className="font-['Playfair_Display',Georgia,serif] font-bold"
            style={{
              fontSize: 17,
              color: "#ffffff",
              lineHeight: 1.25,
              textShadow: "0 2px 8px rgba(0,0,0,.9)",
            }}
            title={pack.name}
          >
            {pack.name}
          </h3>
        </div>
      </div>

      {/* ============================================================
          BODY — meta + description + download button
          ============================================================ */}
      <div className="p-4 flex flex-col flex-1">
        {/* Setting + Player count + Duration row */}
        <div
          className="flex items-center gap-3 mb-3 flex-wrap"
          style={{ fontSize: 11.5, color: C.secondary }}
        >
          {pack.setting && (
            <span
              className="inline-flex items-center gap-1 truncate"
              style={{ maxWidth: "100%" }}
            >
              📍 {pack.setting}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> {pack.playerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> {pack.duration} min
          </span>
        </div>

        {/* Description */}
        {pack.description && (
          <p
            className="mb-4"
            style={{
              fontSize: 12.5,
              color: C.secondary,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {pack.description}
          </p>
        )}

        {/* Download button */}
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="mt-auto w-full flex items-center justify-center gap-2 h-[44px] rounded-[10px] text-[13.5px] font-bold transition-all hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{
            background: C.goldGradient,
            color: C.mainBg,
            border: `1px solid ${C.goldHover}`,
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,.25), 0 6px 16px rgba(246,197,93,.3)",
          }}
        >
          {downloading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <Download size={15} />
              Download Pack
            </>
          )}
        </button>
      </div>
    </div>
  );
}
