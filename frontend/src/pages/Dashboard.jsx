// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import heroBg from "../assets/images/banner-bg.png";
import {
  FolderOpen,
  FileText,
  Download,
  Users,
  Wand2,
  Puzzle,
  Clock,
  UsersRound,
  MoreVertical,
  ArrowRight,
  Plus,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// 🎨 THEME — new :root palette
// ================================================================
const C = {
  mainBg: "#000C16",
  sidebar: "#00101A",

  card: "#031520",
  cardSecondary: "#0C1926",

  input: "#000611",
  textarea: "#011119",

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

  // Aliases to keep existing references working
  cyan: "#00D4D9",
  cyanHover: "#3EE4E8",
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const clean = path.startsWith("/") ? path : `/${path}`;

  // Frontend static assets (Vite public folder)
  if (clean.startsWith("/mystery-templates/")) {
    return clean;
  }

  // Backend uploads
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// STATIC DATA
// ================================================================
const STATS = [
  {
    value: "12",
    label: "Total Mysteries",
    trend: "↑ 20%",
    trendColor: C.turquoise,
    icon: FolderOpen,
    iconColor: C.gold,
    iconBg: "linear-gradient(140deg, #3a2a11, #5a3e18)",
  },
  {
    value: "3",
    label: "Drafts",
    trend: "→ 0%",
    trendColor: C.heading,
    icon: FileText,
    iconColor: C.turquoise,
    iconBg: "linear-gradient(140deg, #0a3a3c, #0d4f52)",
  },
  {
    value: "8",
    label: "Exports",
    trend: "↑ 60%",
    trendColor: C.turquoise,
    icon: Download,
    iconColor: C.goldHover,
    iconBg: "linear-gradient(140deg, #3a2a11, #5a3e18)",
  },
  {
    value: "5",
    label: "Templates Used",
    trend: "↑ 25%",
    trendColor: C.turquoise,
    icon: Users,
    iconColor: C.turquoise,
    iconBg: "linear-gradient(140deg, #0a3a3c, #0d4f52)",
  },
];

const RECENT_MYSTERIES = [
  {
    title: "The Blackwood Manor Mystery",
    pill: "Detective Mystery",
    pillClass: "",
    players: "5–8 players",
    duration: "60 min",
  },
  {
    title: "Deadly Cruise at Midnight",
    pill: "Murder Mystery",
    pillClass: "pink",
    players: "6–10 players",
    duration: "90 min",
  },
  {
    title: "The Lost Treasure of Raven Cove",
    pill: "Treasure Hunt",
    pillClass: "green",
    players: "2–4 players",
    duration: "45 min",
  },
];

const QUICK_ACTIONS = [
  {
    title: "Create New Mystery",
    desc: "Generate a complete case\nwith AI",
    icon: Wand2,
    color: "gold",
  },
  {
    title: "Browse Templates",
    desc: "Use ready-made themes",
    icon: FileText,
    color: "cyan",
  },
  {
    title: "Design Characters",
    desc: "Create suspects with AI",
    icon: Users,
    color: "gold",
  },
  {
    title: "Build Puzzles",
    desc: "Generate logic puzzles\nand riddles",
    icon: Puzzle,
    color: "cyan",
  },
];

const FEATURED_TEMPLATES = [
  { name: "Victorian Murder Mystery", category: "Detective Mystery" },
  { name: "Haunted Manor", category: "Paranormal Mystery" },
  { name: "Luxury Cruise", category: "Murder Mystery" },
  { name: "Ancient Treasure", category: "Treasure Hunt" },
  { name: "1920s Speakeasy", category: "Historical Mystery" },
  { name: "Missing Expedition", category: "Adventure Mystery" },
];

// ================================================================
// ACTION COLOR MAP — gold / turquoise only
// ================================================================
const ACTION_STYLES = {
  gold: {
    border: C.darkGold,
    bg: "linear-gradient(110deg, #2a1f0c, #1a1208)",
    iconBg: "linear-gradient(140deg, #3a2a11, #5a3e18)",
    iconColor: C.gold,
    arrowColor: C.gold,
  },
  cyan: {
    border: "#0a7d7f",
    bg: "linear-gradient(110deg, #0a2a2c, #061a1b)",
    iconBg: "linear-gradient(140deg, #0a3a3c, #0d4f52)",
    iconColor: C.turquoise,
    arrowColor: C.turquoise,
  },
};

// ================================================================
// TRENDING CATEGORIES
// ================================================================
function TrendingCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/categories");
        if (!cancelled) setCategories((res.data?.data || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="flex justify-between items-center mb-2 h-6">
        <h2
          className="text-[19px] sm:text-[21px] font-bold"
          style={{ color: C.heading }}
        >
          Trending Categories
        </h2>
        <span
          className="text-[14px] sm:text-[15px] cursor-pointer transition-colors"
          style={{ color: C.gold }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.goldHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.gold)}
        >
          View all →
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[9px] animate-pulse"
              style={{ background: C.input, paddingBottom: "60%" }}
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div
          className="rounded-[10px] p-8 text-center"
          style={{ border: `1px solid ${C.border}`, background: C.card }}
        >
          <p className="text-[15px]" style={{ color: C.secondary }}>
            No categories yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                navigate("/templates", {
                  state: { categoryId: cat.id, categorySlug: cat.slug },
                })
              }
              className="group rounded-[9px] overflow-hidden flex flex-col text-left transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
              style={{ border: `1px solid ${C.border}`, background: C.card }}
            >
              <div
                className="relative shrink-0 overflow-hidden"
                style={{ background: C.input, paddingBottom: "60%" }}
              >
                {cat.image ? (
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[32px] opacity-60">
                    📁
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div
                  className="text-[15px] font-semibold leading-[1.35] transition-colors"
                  style={{ color: C.heading }}
                >
                  {cat.name}
                </div>
                {cat.description && (
                  <p
                    className="text-[13px] mt-1.5 leading-[1.4] line-clamp-2"
                    style={{ color: C.secondary }}
                  >
                    {cat.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen"
      style={{ background: C.mainBg, color: C.heading }}
    >
      <Sidebar />

      <div
        className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen "
      >
        <Navbar />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 12px 20px 20px" }}
        >
          <div className="max-w-[1650px] mx-auto">
            {/* HERO */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-[19px]"
              style={{
                background: "#000000",
                paddingTop: "40px",
                paddingBottom: "40px",
                minHeight: "360px",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${heroBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                  backgroundRepeat: "no-repeat",
                  zIndex: 0,
                }}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.72) 42%, rgba(0,0,0,.35) 80%, rgba(0,0,0,.15) 100%)",
                  zIndex: 1,
                }}
              />

              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: "40%",
                  background:
                    "linear-gradient(180deg, transparent, rgba(0,0,0,.45))",
                  zIndex: 1,
                }}
              />

              <div
                className="relative z-10"
                style={{ paddingLeft: 29, paddingRight: 29 }}
              >
                <div
                  className="inline-flex items-center gap-2 mb-4"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(246,197,93,.12)",
                    border: `1px solid ${C.gold}55`,
                    color: C.gold,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.gold,
                      boxShadow: `0 0 8px ${C.gold}`,
                    }}
                  />
                  AI Mystery Game Creator
                </div>

                <h1
                  className="mm-serif"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(34px, 5.5vw, 54px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    margin: "0 0 14px",
                    color: "#ffffff",
                  }}
                >
                  Turn One Simple Idea Into a
                  <br />
                  Complete{" "}
                  <em style={{ fontStyle: "normal", color: C.gold }}>
                    Mystery Game
                  </em>
                  <br />
                  <em style={{ fontStyle: "normal", color: C.gold }}>
                    With AI
                  </em>
                </h1>

                <p
                  style={{
                    fontSize: "clamp(15px, 1.8vw, 19px)",
                    lineHeight: "30px",
                    margin: "0 0 24px",
                    color: C.heading,
                    maxWidth: 620,
                  }}
                >
                  Stories, suspects, clues, puzzles and beautiful game kits
                  <br className="hidden sm:block" />— ready to play or sell.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/create-product")}
                    className="flex items-center transition-all hover:-translate-y-[1px]"
                    style={{
                      height: 50,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 16,
                      gap: 14,
                      background: C.goldGradient,
                      color: "#000C16",
                      border: `1px solid ${C.goldHover}`,
                      borderRadius: 11,
                      fontWeight: 700,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.filter = "brightness(1.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.filter = "brightness(1)")
                    }
                  >
                    <Plus size={19} />
                    Create New Mystery
                    <ArrowRight size={19} />
                  </button>

                  <button
                    onClick={() => navigate("/templates")}
                    className="flex items-center transition-all hover:-translate-y-[1px]"
                    style={{
                      height: 50,
                      paddingLeft: 22,
                      paddingRight: 22,
                      fontSize: 15,
                      gap: 10,
                      background: "rgba(255,255,255,.06)",
                      color: C.heading,
                      border: "1px solid rgba(255,255,255,.18)",
                      borderRadius: 11,
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      cursor: "pointer",
                    }}
                  >
                    Browse Templates
                  </button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-[18px]">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[12px] flex items-center"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.card,
                      padding: 12,
                      gap: 14,
                    }}
                  >
                    <div
                      className="grid place-items-center shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        color: s.iconColor,
                        background: s.iconBg,
                      }}
                    >
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-bold leading-none"
                        style={{
                          fontSize: "clamp(24px, 3vw, 34px)",
                          color: C.heading,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          fontSize: "clamp(12px, 1.3vw, 15px)",
                          color: C.secondary,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                    <div className="hidden lg:block text-right shrink-0 ml-auto">
                      <strong style={{ fontSize: 17, color: s.trendColor }}>
                        {s.trend}
                      </strong>
                      <small
                        className="block"
                        style={{
                          fontSize: 12,
                          marginTop: 8,
                          color: C.secondary,
                        }}
                      >
                        vs last month
                      </small>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* PANELS */}
            <section className="grid grid-cols-1 lg:grid-cols-[1.425fr_1fr] gap-4 mb-[18px]">
              {/* Recent Mysteries */}
              <div
                className="rounded-[12px] min-w-0"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  padding: "13px 15px 9px",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2
                    className="font-bold m-0"
                    style={{ fontSize: 21, color: C.heading }}
                  >
                    Recent Mysteries
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/my-mysteries")}
                    className="font-semibold transition"
                    style={{
                      color: C.gold,
                      fontSize: 14,
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    View All <ArrowRight size={12} className="inline" />
                  </button>
                </div>

                {RECENT_MYSTERIES.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center"
                    style={{
                      gap: 16,
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: 12,
                      paddingBottom: 12,
                    }}
                  >
                    <div
                      className="shrink-0"
                      style={{
                        width: 100,
                        height: 66,
                        border: `1px solid ${C.border}`,
                        borderRadius: 9,
                        background: C.input,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold truncate"
                        style={{
                          fontSize: 16,
                          marginBottom: 8,
                          color: C.heading,
                        }}
                      >
                        {m.title}
                      </div>
                      <div
                        className="flex items-center flex-wrap"
                        style={{ gap: 12, fontSize: 13 }}
                      >
                        <span
                          className="rounded-full"
                          style={{
                            padding: "5px 10px",
                            background:
                              m.pillClass === "pink"
                                ? "#2a0f18"
                                : m.pillClass === "green"
                                  ? "#052a24"
                                  : C.input,
                            border:
                              m.pillClass === "pink"
                                ? "1px solid #6b2233"
                                : m.pillClass === "green"
                                  ? `1px solid ${C.turquoise}55`
                                  : `1px solid ${C.border}`,
                            color:
                              m.pillClass === "pink"
                                ? "#ff9eb8"
                                : m.pillClass === "green"
                                  ? C.turquoise
                                  : C.heading,
                            fontWeight: 500,
                          }}
                        >
                          {m.pill}
                        </span>
                        <span
                          className="flex items-center"
                          style={{ color: C.secondary, gap: 5 }}
                        >
                          <UsersRound size={12} /> {m.players}
                        </span>
                        <span
                          className="flex items-center"
                          style={{ color: C.secondary, gap: 5 }}
                        >
                          <Clock size={12} /> {m.duration}
                        </span>
                      </div>
                    </div>
                    <button
                      className="shrink-0 transition-colors"
                      style={{
                        padding: "8px 9px",
                        color: C.secondary,
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = C.heading)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = C.secondary)
                      }
                    >
                      <MoreVertical size={16} />
                    </button>
                    <button
                      className="shrink-0 transition-all"
                      style={{
                        border: `1px solid ${C.border}`,
                        background: C.input,
                        color: C.gold,
                        borderRadius: 8,
                        padding: "10px 22px",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.gold;
                        e.currentTarget.style.background = C.cardSecondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.background = C.input;
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div
                className="rounded-[12px] min-w-0"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  padding: "13px 15px 15px",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2
                    className="font-bold m-0"
                    style={{ fontSize: 21, color: C.heading }}
                  >
                    Quick Actions
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {QUICK_ACTIONS.map((a, idx) => {
                    const Icon = a.icon;
                    const S = ACTION_STYLES[a.color];
                    return (
                      <button
                        key={idx}
                        className="rounded-[11px] text-left relative transition-all hover:-translate-y-[1px] hover:brightness-110"
                        style={{
                          border: `1px solid ${S.border}`,
                          background: S.bg,
                          minHeight: 105,
                          display: "flex",
                          gap: 14,
                          padding: "12px 10px",
                          color: C.heading,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (a.title === "Create New Mystery") {
                            navigate("/create-product");
                          } else if (a.title === "Browse Templates") {
                            navigate("/templates");
                          }
                        }}
                      >
                        <div
                          className="grid place-items-center shrink-0"
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 13,
                            background: S.iconBg,
                            color: S.iconColor,
                          }}
                        >
                          <Icon size={24} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="font-bold"
                            style={{
                              fontSize: 14,
                              marginTop: 10,
                              whiteSpace: "nowrap",
                              color: C.heading,
                            }}
                          >
                            {a.title}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              lineHeight: "20px",
                              marginTop: 4,
                              color: C.secondary,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {a.desc}
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 12,
                            color: S.arrowColor,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* FEATURED TEMPLATES */}
            <section
              className="rounded-[12px]"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                padding: "13px 15px 15px",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2
                  className="font-bold m-0"
                  style={{ fontSize: 21, color: C.heading }}
                >
                  Featured Templates
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/templates")}
                  className="font-semibold transition whitespace-nowrap"
                  style={{
                    color: C.gold,
                    fontSize: 14,
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = C.goldHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = C.gold)
                  }
                >
                  Browse All Templates{" "}
                  <ArrowRight size={12} className="inline" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {FEATURED_TEMPLATES.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-[10px] overflow-hidden cursor-pointer transition-all hover:-translate-y-[2px]"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.cardSecondary,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = C.gold)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = C.border)
                    }
                  >
                    <div
                      className="relative"
                      style={{
                        background: C.card,
                        borderBottom: `1px solid ${C.border}`,
                        paddingBottom: "68%",
                      }}
                    />
                    <div style={{ padding: "8px 13px" }}>
                      <div
                        className="font-bold truncate"
                        style={{ fontSize: 14, color: C.heading }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="truncate"
                        style={{
                          fontSize: 13,
                          color: C.secondary,
                          marginTop: 7,
                        }}
                      >
                        {t.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}