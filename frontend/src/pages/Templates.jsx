// frontend/src/pages/Templates.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Clock,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import templatesBg from "../assets/images/templates-banner-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// LUXURY DETECTIVE THEME
// ================================================================
const C = {
  mainBg: "#080D13",
  card: "#14212D",
  input: "#192B38",
  gold: "#F5B942",
  goldHover: "#FFD66B",
  cyan: "#00D5D8",
  cyanHover: "#50F2F0",
  heading: "#F8FAFC",
  secondary: "#9AAEBD",
  border: "#2A3B48",
  darkGold: "#B77A1D",
};

const GENRES = [
  "All",
  "Murder Mystery",
  "Detective Mystery",
  "Treasure Hunt",
  "Spy Thriller",
  "Horror Mystery",
  "Sci-Fi Mystery",
];

// ================================================================
// IMAGE URL RESOLVER — frontend-only, no backend needed
// ================================================================
const getImageUrl = (path) => {
  if (!path) return "";

  // Full URL — use as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const clean = path.startsWith("/") ? path : `/${path}`;

  // ✅ Files in `frontend/public/mystery-templates/` are served by Vite
  //    at the root URL, so we return the path untouched.
  if (clean.startsWith("/mystery-templates/")) {
    return clean;
  }

  // Anything else (e.g. backend /uploads/...) → prefix with backend host
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// MAIN PAGE
// ================================================================
export default function Templates() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // ---------- FETCH ----------
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeGenre !== "All") params.genre = activeGenre;
      if (featuredOnly) params.featured = "true";
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/templates", { params });
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

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGenre, featuredOnly]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchTemplates();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ---------- PICK A TEMPLATE ----------
  const handleUseTemplate = (template) => {
    navigate("/create-mystery", {
      state: {
        templateId: template._id,
        template: {
          name: template.name,
          genre: template.genre,
          setting: template.setting,
          difficulty: template.difficulty,
          playerCount: template.playerCount,
          duration: template.duration,
          targetAudience: template.targetAudience,
          storyIdea: template.storyIdea || "",
        },
      },
    });
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: C.mainBg, color: C.heading }}
    >
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 12px 24px 20px" }}
        >
          <div className="max-w-[1650px] mx-auto">
            {/* HERO */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-[19px]"
              style={{
                background:
                  "linear-gradient(90deg, #020907 0%, #071c19 68%, #0b2520 100%)",
                paddingTop: "42px",
                paddingBottom: "42px",
                paddingLeft: "30px",
                paddingRight: "30px",
                minHeight: "300px",
              }}
            >
              {/* ===== BACKGROUND IMAGE (absolute) ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${templatesBg})`,
                }}
              />

              {/* ===== DARK GRADIENT OVERLAY ===== */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.62)_45%,rgba(0,0,0,.15)_82%,transparent_100%)]" />

              {/* ===== SOFT BOTTOM FADE ===== */}
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.35))]" />

              {/* ===== CONTENT ===== */}
              <div className="relative z-10">
                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 mb-4 px-[14px] py-[6px] rounded-full"
                  style={{
                    background: "rgba(245,185,66,.12)",
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
                  Preset Library
                </div>

                {/* Heading */}
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
                  Start With a{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Mystery Template
                  </em>
                </h1>

                {/* Description */}
                <p
                  className="leading-[26px] mb-[22px]"
                  style={{
                    fontSize: "clamp(14px,1.6vw,17px)",
                    color: C.heading,
                    maxWidth: 620,
                  }}
                >
                  Pick a preset — genre, setting, difficulty, players and
                  duration —
                  <br className="hidden xl:block" /> then jump straight into
                  generation.
                </p>

                {/* Feature bullets */}
                <div className="flex flex-wrap items-center mt-6 gap-x-[26px] gap-y-[14px]">
                  {[
                    "10+ curated presets",
                    "One-click fill",
                    "Instant generation",
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

            {/* FILTERS */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-[420px]">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.gold }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full outline-none transition-colors"
                  style={{
                    height: 46,
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    borderRadius: 11,
                    color: C.heading,
                    padding: "0 15px 0 44px",
                    fontSize: 14,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.gold)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>

              <button
                type="button"
                onClick={() => setFeaturedOnly((v) => !v)}
                className="inline-flex items-center gap-2 h-[46px] px-4 rounded-[11px] text-[13px] font-semibold transition-all"
                style={{
                  background: featuredOnly ? C.gold : C.input,
                  color: featuredOnly ? C.mainBg : C.heading,
                  border: `1px solid ${featuredOnly ? C.goldHover : C.border}`,
                }}
              >
                <Star
                  size={15}
                  fill={featuredOnly ? C.mainBg : "transparent"}
                />
                Featured only
              </button>

              <div
                className="text-[12.5px] font-medium ml-auto"
                style={{ color: C.secondary }}
              >
                {templates.length}{" "}
                {templates.length === 1 ? "template" : "templates"}
              </div>
            </div>

            {/* Genre tabs */}
            <div className="mb-5 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = activeGenre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setActiveGenre(g)}
                    className="h-[36px] px-4 rounded-full text-[12.5px] font-semibold transition-all"
                    style={{
                      background: active ? C.gold : C.input,
                      color: active ? C.mainBg : C.secondary,
                      border: `1px solid ${active ? C.goldHover : C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = C.heading;
                        e.currentTarget.style.borderColor = C.gold;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = C.secondary;
                        e.currentTarget.style.borderColor = C.border;
                      }
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* TEMPLATES GRID */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="rounded-[12px] overflow-hidden animate-pulse"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      height: 380,
                    }}
                  />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div
                className="rounded-[12px] p-12 text-center"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="grid place-items-center mx-auto mb-5"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(245,185,66,.1)",
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  <BookOpen size={32} style={{ color: C.gold }} />
                </div>
                <h3
                  className="font-['Playfair_Display',Georgia,serif] mb-2"
                  style={{ fontSize: 22, color: C.heading }}
                >
                  No templates found
                </h3>
                <p
                  className="leading-[1.6] max-w-[420px] mx-auto"
                  style={{ fontSize: 14, color: C.secondary }}
                >
                  Try a different genre, clear the search, or check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates.map((t) => {
                  const cover = t.thumbnail
                    ? getImageUrl(t.thumbnail)
                    : t.coverImage
                      ? getImageUrl(t.coverImage)
                      : null;

                  return (
                    <div
                      key={t._id}
                      className="rounded-[12px] overflow-hidden transition-all hover:-translate-y-[2px] flex flex-col"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = C.gold)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = C.border)
                      }
                    >
                      {/* Cover */}
                      <div
                        className="relative"
                        style={{
                          height: 220,
                          background: "#000000",
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={t.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center">
                            <div
                              className="grid place-items-center"
                              style={{
                                width: 62,
                                height: 62,
                                borderRadius: "50%",
                                background: "rgba(245,185,66,.1)",
                                border: `1px solid ${C.gold}55`,
                              }}
                            >
                              <Sparkles size={26} style={{ color: C.gold }} />
                            </div>
                          </div>
                        )}

                        {t.isFeatured && (
                          <div
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              background: C.gold,
                              color: C.mainBg,
                              fontSize: 10.5,
                              fontWeight: 700,
                              letterSpacing: ".4px",
                              boxShadow: "0 4px 12px rgba(245,185,66,.4)",
                            }}
                          >
                            <Star size={10} fill={C.mainBg} />
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div
                        className="flex flex-col flex-1"
                        style={{ padding: 16 }}
                      >
                        <div className="flex-1 min-h-0">
                          <h3
                            className="font-semibold mb-1.5 truncate"
                            style={{ fontSize: 15, color: C.heading }}
                            title={t.name}
                          >
                            {t.name}
                          </h3>

                          <div
                            className="flex flex-wrap items-center gap-2 mb-3"
                            style={{ fontSize: 11.5, color: C.secondary }}
                          >
                            <span
                              className="px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(245,185,66,.12)",
                                border: `1px solid ${C.gold}45`,
                                color: C.gold,
                                fontWeight: 500,
                              }}
                            >
                              {t.genre}
                            </span>
                            <span className="truncate" title={t.setting}>
                              {t.setting}
                            </span>
                          </div>

                          {t.description && (
                            <p
                              className="leading-[1.5] mb-3"
                              style={{
                                fontSize: 12.5,
                                color: C.secondary,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {t.description}
                            </p>
                          )}

                          <div
                            className="flex items-center flex-wrap gap-x-4 gap-y-1.5"
                            style={{ fontSize: 11.5, color: C.secondary }}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Users size={11} /> {t.playerCount}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={11} /> {t.duration} min
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Zap size={11} /> {t.difficulty}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUseTemplate(t)}
                          className="mt-4 w-full flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13.5px] font-bold transition-all hover:-translate-y-[1px]"
                          style={{
                            background: C.gold,
                            color: C.mainBg,
                            border: `1px solid ${C.goldHover}`,
                            boxShadow:
                              "inset 0 1px 1px rgba(255,255,255,.25), 0 6px 16px rgba(245,185,66,.3)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = C.goldHover)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = C.gold)
                          }
                        >
                          <Sparkles size={15} />
                          Use This Template
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
