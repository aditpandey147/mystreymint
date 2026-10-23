// frontend/src/pages/UnlimitedTemplates.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Loader2,
  Star,
  Users,
  Clock,
  ChevronDown,
  X,
  BookOpen,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import unlimitedTemplatesBg from "../../assets/images/unlimited-templates-bg.png";

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
// MAIN PAGE — RENDERS EVERY TEMPLATE (no pagination)
// ================================================================
export default function UnlimitedTemplates() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // ================================================================
  // FETCH ALL TEMPLATES (once)
  // ================================================================
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (res.data?.success) {
          setTemplates(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        toast.error(err.response?.data?.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // ================================================================
  // DERIVED FILTER OPTIONS
  // ================================================================
  const genres = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      if (t.genre) set.add(t.genre);
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  const difficulties = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      if (t.difficulty) set.add(t.difficulty);
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  // ================================================================
  // FILTERED + SORTED LIST
  // ================================================================
  const filteredTemplates = useMemo(() => {
    let list = [...templates];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.genre?.toLowerCase().includes(q) ||
          t.setting?.toLowerCase().includes(q) ||
          (Array.isArray(t.tags) &&
            t.tags.some((tag) => String(tag).toLowerCase().includes(q))),
      );
    }

    // Genre
    if (genre !== "All") {
      list = list.filter((t) => t.genre === genre);
    }

    // Difficulty
    if (difficulty !== "All") {
      list = list.filter((t) => t.difficulty === difficulty);
    }

    // Sort
    if (sort === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else if (sort === "popular") {
      list.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (a.order || 0) - (b.order || 0);
      });
    }

    return list;
  }, [templates, search, genre, difficulty, sort]);

  // ================================================================
  // ACTIONS
  // ================================================================
  const handleTemplateClick = (template) => {
    navigate("/create-mystery", {
      state: {
        templateId: template._id,
        template: {
          _id: template._id,
          name: template.name,
          genre: template.genre,
          setting: template.setting,
          difficulty: template.difficulty,
          playerCount: template.playerCount,
          duration: template.duration,
          targetAudience: template.targetAudience,
          storyIdea: template.storyIdea,
          thumbnail: template.thumbnail,
          coverImage: template.coverImage,
        },
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setGenre("All");
    setDifficulty("All");
    setSort("featured");
  };

  const activeFilterCount =
    (genre !== "All" ? 1 : 0) +
    (difficulty !== "All" ? 1 : 0) +
    (sort !== "featured" ? 1 : 0);

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
                minHeight: "260px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${unlimitedTemplatesBg})`,
                }}
              />

              {/* ===== DARK GRADIENT OVERLAY ===== */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.35)_82%,rgba(0,0,0,.15)_100%)]" />

              {/* ===== SOFT BOTTOM FADE ===== */}
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.45))]" />

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
                  Unlimited Templates
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
                  Browse{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Every Template
                  </em>
                </h1>
                <p
                  className="leading-[26px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  All templates in one endless scroll — click any card to jump
                  straight into the create-mystery page with everything
                  prefilled.
                </p>

                {/* Live count */}
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
                      <BookOpen size={12} />
                      {templates.length}{" "}
                      {templates.length === 1 ? "template" : "templates"}
                    </span>

                    {filteredTemplates.length !== templates.length && (
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
                        <Search size={12} />
                        {filteredTemplates.length} shown
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>
            {/* ========== SEARCH + FILTERS ========== */}
            <div
              className="rounded-[12px] p-4 mb-5"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: C.gold }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, genre, setting…"
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
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Used</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: C.gold }}
                  />
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className="flex items-center gap-2 h-[44px] px-4 rounded-[10px] text-[13px] font-semibold transition-all"
                  style={{
                    background: showFilters ? "rgba(246,197,93,.1)" : C.input,
                    color: showFilters ? C.gold : C.heading,
                    border: `1px solid ${showFilters ? C.gold : C.border}`,
                  }}
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span
                      className="grid place-items-center rounded-full"
                      style={{
                        minWidth: 18,
                        height: 18,
                        background: C.gold,
                        color: C.mainBg,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="h-[44px] px-4 rounded-[10px] text-[13px] font-semibold"
                    style={{
                      background: "transparent",
                      color: C.secondary,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div
                  className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div>
                    <label
                      className="block mb-2 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Genre
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {genres.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGenre(g)}
                          className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all"
                          style={{
                            background: genre === g ? C.gold : "transparent",
                            color: genre === g ? C.mainBg : C.secondary,
                            border: `1px solid ${
                              genre === g ? C.gold : C.border
                            }`,
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block mb-2 text-[12px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Difficulty
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {difficulties.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all"
                          style={{
                            background:
                              difficulty === d ? C.gold : "transparent",
                            color: difficulty === d ? C.mainBg : C.secondary,
                            border: `1px solid ${
                              difficulty === d ? C.gold : C.border
                            }`,
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========== TEMPLATES GRID — ALL AT ONCE ========== */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[12px]"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      height: 340,
                    }}
                  />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div
                className="rounded-[12px] p-12 text-center"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
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
                  <BookOpen size={28} style={{ color: C.gold }} />
                </div>
                <h3
                  className="font-['Playfair_Display',Georgia,serif] mb-2"
                  style={{ fontSize: 22, color: C.heading }}
                >
                  No templates found
                </h3>
                <p
                  className="mx-auto max-w-[400px]"
                  style={{ fontSize: 13, color: C.secondary }}
                >
                  {search || activeFilterCount > 0
                    ? "Try adjusting your search or filters."
                    : "Templates will appear here once they're added."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 h-[42px] px-5 rounded-[10px] text-[13px] font-bold"
                    style={{
                      background: C.gold,
                      color: C.mainBg,
                      border: `1px solid ${C.goldHover}`,
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                    />
                  ))}
                </div>

                {/* End marker */}
                <div className="text-center py-8">
                  <div
                    style={{
                      fontSize: 12,
                      color: C.muted,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    ✦ End of Templates ✦
                  </div>
                  <div
                    className="mt-2"
                    style={{ fontSize: 11, color: C.secondary }}
                  >
                    {filteredTemplates.length} template
                    {filteredTemplates.length === 1 ? "" : "s"} shown
                    {filteredTemplates.length !== templates.length &&
                      ` of ${templates.length} total`}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// TEMPLATE CARD
// ================================================================
function TemplateCard({ template, onClick }) {
  const cover = template.thumbnail
    ? getImageUrl(template.thumbnail)
    : template.coverImage
      ? getImageUrl(template.coverImage)
      : null;

  const difficultyColor =
    template.difficulty === "Hard"
      ? "#ff8fa8"
      : template.difficulty === "Easy"
        ? C.cyan
        : C.gold;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[12px] overflow-hidden flex flex-col text-left transition-all hover:-translate-y-[3px] group"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        cursor: "pointer",
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
      {/* Thumbnail */}
      <div
        className="relative"
        style={{
          aspectRatio: "4 / 3",
          background: "#000000",
          borderBottom: `1px solid ${C.border}`,
          overflow: "hidden",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={template.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            style={{ transitionDuration: "500ms" }}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles size={36} style={{ color: C.gold, opacity: 0.4 }} />
          </div>
        )}

        {template.isFeatured && (
          <span
            className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: C.gold,
              color: C.mainBg,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <Star size={10} fill={C.mainBg} />
            Featured
          </span>
        )}

        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(0,12,22,.85)",
            border: `1px solid ${difficultyColor}`,
            color: difficultyColor,
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".5px",
            backdropFilter: "blur(6px)",
          }}
        >
          {template.difficulty || "Medium"}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3
          className="font-['Playfair_Display',Georgia,serif] font-bold truncate mb-1.5"
          style={{ fontSize: 15, color: C.heading }}
          title={template.name}
        >
          {template.name}
        </h3>

        <div
          className="flex items-center gap-2 mb-2.5 flex-wrap"
          style={{ fontSize: 11.5, color: C.secondary }}
        >
          {template.genre && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(246,197,93,.12)",
                border: `1px solid ${C.gold}45`,
                color: C.gold,
                fontWeight: 500,
              }}
            >
              {template.genre}
            </span>
          )}
          {template.setting && (
            <span className="truncate">{template.setting}</span>
          )}
        </div>

        <div
          className="flex items-center gap-3 mb-3 flex-wrap"
          style={{ fontSize: 11, color: C.muted }}
        >
          {template.playerCount && (
            <span className="inline-flex items-center gap-1">
              <Users size={10} /> {template.playerCount}
            </span>
          )}
          {template.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} /> {template.duration} min
            </span>
          )}
        </div>

        {template.description && (
          <p
            className="mb-3 line-clamp-2"
            style={{ fontSize: 11.5, color: C.secondary, lineHeight: 1.5 }}
          >
            {template.description}
          </p>
        )}

        <div
          className="mt-auto flex items-center justify-center gap-1.5 h-[38px] rounded-[9px] font-bold text-[12.5px] transition-all"
          style={{
            background: C.goldGradient,
            color: C.mainBg,
            border: `1px solid ${C.goldHover}`,
          }}
        >
          Use Template
          <ArrowRight size={13} />
        </div>
      </div>
    </button>
  );
}
