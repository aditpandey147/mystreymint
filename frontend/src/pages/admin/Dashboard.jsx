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
  Loader2,
  Sparkles,
} from "lucide-react";

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
  cyan: "#00D4D9",
  cyanHover: "#3EE4E8",
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean.startsWith("/mystery-templates/")) return clean;
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// STATIC DATA
// ================================================================
const QUICK_ACTIONS = [
  {
    title: "Create New Mystery",
    desc: "Generate a complete case\nwith AI",
    icon: Wand2,
    color: "gold",
    path: "/create-mystery",
  },
  {
    title: "Browse Templates",
    desc: "Use ready-made themes",
    icon: FileText,
    color: "cyan",
    path: "/templates",
  },
  {
    title: "Design Characters",
    desc: "Create suspects with AI",
    icon: Users,
    color: "gold",
    path: "/character-studio",
  },
  {
    title: "Build Puzzles",
    desc: "Generate logic puzzles\nand riddles",
    icon: Puzzle,
    color: "cyan",
    path: "/puzzle-studio",
  },
];

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
// RECENT MYSTERIES — live from /mysteries
// ================================================================
function RecentMysteries() {
  const navigate = useNavigate();
  const [mysteries, setMysteries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchRecent = async () => {
      try {
        setLoading(true);
        const res = await api.get("/mysteries");
        if (!cancelled && res.data?.success) {
          setMysteries((res.data.data || []).slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load recent mysteries:", err);
        if (!cancelled) setMysteries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecent();
    return () => {
      cancelled = true;
    };
  }, []);

  const pillClassFor = (genre) => {
    if (!genre) return "";
    const g = genre.toLowerCase();
    if (g.includes("murder")) return "pink";
    if (g.includes("treasure") || g.includes("adventure")) return "green";
    return "";
  };

  return (
    <div
      className="rounded-[12px] min-w-0"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        padding: "13px 15px 9px",
      }}
    >
      {/* Header — align items center, allow wrap on mobile */}
      <div className="flex justify-between items-center mb-2 gap-2">
        <h2
          className="font-bold m-0"
          style={{ fontSize: 21, color: C.heading }}
        >
          Recent Mysteries
        </h2>
        <button
          type="button"
          onClick={() => navigate("/my-mysteries")}
          className="font-semibold transition whitespace-nowrap shrink-0"
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

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[9px]"
              style={{
                height: 66,
                background: C.input,
                border: `1px solid ${C.border}`,
              }}
            />
          ))}
        </div>
      ) : mysteries.length === 0 ? (
        <div className="py-10 text-center">
          <div
            className="grid place-items-center mx-auto mb-3"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(246,197,93,.1)",
              border: `1px solid ${C.gold}55`,
            }}
          >
            <Sparkles size={22} style={{ color: C.gold }} />
          </div>
          <p style={{ fontSize: 14, color: C.secondary, marginBottom: 14 }}>
            No mysteries yet
          </p>
          <button
            onClick={() => navigate("/create-mystery")}
            className="inline-flex items-center gap-2 px-5 py-[10px] rounded-[10px] text-[13px] font-bold"
            style={{
              background: C.goldGradient,
              color: C.mainBg,
              border: `1px solid ${C.goldHover}`,
            }}
          >
            <Plus size={14} />
            Create Your First Mystery
          </button>
        </div>
      ) : (
        mysteries.map((m, idx) => {
          const cover = m.images?.cover ? getImageUrl(m.images.cover) : null;
          const pillClass = pillClassFor(m.genre);
          return (
            <div
              key={m._id || idx}
              className="flex items-center gap-2.5 sm:gap-4"
              style={{
                borderTop: `1px solid ${C.border}`,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {/* Cover thumbnail — fixed aspect ratio, no broken padding trick */}
              <div
                className="shrink-0 overflow-hidden relative w-[70px] sm:w-[100px]"
                style={{
                  aspectRatio: "3 / 2",
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  background: C.input,
                }}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={m.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <FileText
                      size={20}
                      style={{ color: C.gold, opacity: 0.5 }}
                    />
                  </div>
                )}
              </div>

              {/* Content — grows, truncates properly */}
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold truncate"
                  style={{
                    fontSize: 15,
                    marginBottom: 6,
                    color: C.heading,
                  }}
                  title={m.title}
                >
                  {m.title}
                </div>
                <div
                  className="flex items-center flex-wrap"
                  style={{ gap: 8, fontSize: 12 }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      padding: "4px 9px",
                      background:
                        pillClass === "pink"
                          ? "#2a0f18"
                          : pillClass === "green"
                            ? "#052a24"
                            : C.input,
                      border:
                        pillClass === "pink"
                          ? "1px solid #6b2233"
                          : pillClass === "green"
                            ? `1px solid ${C.turquoise}55`
                            : `1px solid ${C.border}`,
                      color:
                        pillClass === "pink"
                          ? "#ff9eb8"
                          : pillClass === "green"
                            ? C.turquoise
                            : C.heading,
                      fontWeight: 500,
                    }}
                  >
                    {m.genre || "Mystery"}
                  </span>
                  <span
                    className="flex items-center"
                    style={{ color: C.secondary, gap: 5 }}
                  >
                    <UsersRound size={12} /> {m.playerCount || "—"}
                  </span>
                  <span
                    className="flex items-center"
                    style={{ color: C.secondary, gap: 5 }}
                  >
                    <Clock size={12} /> {m.duration ? `${m.duration} min` : "—"}
                  </span>
                </div>
              </div>

              {/* Actions — grouped together, aligned right, never wrap awkwardly */}
              <div className="shrink-0 flex items-center gap-1 sm:gap-2">
                <button
                  className="transition-colors"
                  style={{
                    padding: "8px 6px",
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
                  onClick={() => navigate(`/mystery/${m._id}`)}
                  className="transition-all px-3 sm:px-[22px] py-2 sm:py-[10px]"
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    color: C.gold,
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
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
                  View
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
// ================================================================
// FEATURED TEMPLATES — live from /templates
// ================================================================
function FeaturedTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (!cancelled && res.data?.success) {
          const list = res.data.data || [];
          const featured = list.filter((t) => t.isFeatured);
          const rest = list.filter((t) => !t.isFeatured);
          setTemplates([...featured, ...rest].slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to load featured templates:", err);
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = (t) => {
    navigate("/create-mystery", {
      state: {
        templateId: t._id,
        template: {
          _id: t._id,
          name: t.name,
          genre: t.genre,
          setting: t.setting,
          difficulty: t.difficulty,
          playerCount: t.playerCount,
          duration: t.duration,
          targetAudience: t.targetAudience,
          storyIdea: t.storyIdea,
          thumbnail: t.thumbnail,
          coverImage: t.coverImage,
        },
      },
    });
  };

  return (
    <section
      className="rounded-[12px]"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        padding: "13px 15px 15px",
      }}
    >
      <div className="flex justify-between items-center mb-3 gap-2 flex-wrap sm:flex-nowrap">
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
          onMouseEnter={(e) => (e.currentTarget.style.color = C.goldHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.gold)}
        >
          Browse All Templates <ArrowRight size={12} className="inline" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[10px]"
              style={{
                border: `1px solid ${C.border}`,
                background: C.cardSecondary,
                paddingBottom: "68%",
              }}
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-8 text-center">
          <p style={{ fontSize: 13, color: C.secondary }}>
            No templates available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {templates.map((t) => {
            const cover = t.thumbnail
              ? getImageUrl(t.thumbnail)
              : t.coverImage
                ? getImageUrl(t.coverImage)
                : null;
            return (
              <div
                key={t._id}
                onClick={() => handleClick(t)}
                className="rounded-[10px] overflow-hidden cursor-pointer transition-all hover:-translate-y-[2px] relative"
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
                {/* Cover image — padding bottom instead of fixed height */}
                <div
                  className="relative"
                  style={{
                    background: C.card,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: "68%",
                  }}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={t.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <Sparkles
                        size={20}
                        style={{ color: C.gold, opacity: 0.5 }}
                      />
                    </div>
                  )}
                  {t.isFeatured && (
                    <span
                      className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full"
                      style={{
                        background: C.gold,
                        color: C.mainBg,
                        fontSize: 8.5,
                        fontWeight: 700,
                      }}
                    >
                      ★
                    </span>
                  )}
                </div>

                <div style={{ padding: "8px 10px" }}>
                  <div
                    className="font-bold truncate"
                    style={{ fontSize: 13, color: C.heading }}
                    title={t.name}
                  >
                    {t.name}
                  </div>
                  <div
                    className="truncate"
                    style={{
                      fontSize: 12,
                      color: C.secondary,
                      marginTop: 6,
                    }}
                  >
                    {t.genre || t.category || "Mystery"}
                  </div>
                </div>
              </div>
            );
          })}
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

  const [stats, setStats] = useState({
    total: "—",
    drafts: "—",
    exports: "—",
    templates: "—",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/mysteries");
        if (res.data?.success) {
          const list = res.data.data || [];
          const completed = list.filter(
            (m) => m.generationStatus === "completed",
          ).length;
          const generating = list.filter(
            (m) =>
              m.generationStatus === "generating" ||
              m.generationStatus === "pending" ||
              m.generationStatus === "validating",
          ).length;
          setStats({
            total: String(list.length),
            drafts: String(generating),
            exports: String(completed),
            templates: "6+",
          });
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  const STATS = [
    {
      value: stats.total,
      label: "Total Mysteries",
      trend: "↑ live",
      trendColor: C.turquoise,
      icon: FolderOpen,
      iconColor: C.gold,
      iconBg: "linear-gradient(140deg, #3a2a11, #5a3e18)",
    },
    {
      value: stats.drafts,
      label: "In Progress",
      trend: "→ live",
      trendColor: C.heading,
      icon: FileText,
      iconColor: C.turquoise,
      iconBg: "linear-gradient(140deg, #0a3a3c, #0d4f52)",
    },
    {
      value: stats.exports,
      label: "Completed",
      trend: "↑ live",
      trendColor: C.turquoise,
      icon: Download,
      iconColor: C.goldHover,
      iconBg: "linear-gradient(140deg, #3a2a11, #5a3e18)",
    },
    {
      value: stats.templates,
      label: "Templates Available",
      trend: "↑ live",
      trendColor: C.turquoise,
      icon: Users,
      iconColor: C.turquoise,
      iconBg: "linear-gradient(140deg, #0a3a3c, #0d4f52)",
    },
  ];

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
          style={{ padding: "20px 12px 20px 20px" }}
        >
          <div className="max-w-[1650px] mx-auto">
            {/* HERO — padding based, no fixed heights */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-[19px] py-6 sm:py-10"
              style={{ background: "#000000" }}
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
              <div className="relative z-10 px-4 sm:px-[29px]">
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
                    fontSize: "clamp(28px, 5.5vw, 54px)",
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
                    fontSize: "clamp(14px, 1.8vw, 19px)",
                    lineHeight: "26px",
                    margin: "0 0 24px",
                    color: C.heading,
                    maxWidth: 620,
                  }}
                >
                  Stories, suspects, clues, puzzles and beautiful game kits
                  <br className="hidden sm:block" />— ready to play or sell.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => navigate("/create-mystery")}
                    className="flex items-center justify-center transition-all hover:-translate-y-[1px] w-full sm:w-auto"
                    style={{
                      paddingLeft: 24,
                      paddingRight: 24,
                      paddingTop: 14,
                      paddingBottom: 14,
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
                    className="flex items-center justify-center transition-all hover:-translate-y-[1px] w-full sm:w-auto"
                    style={{
                      paddingLeft: 22,
                      paddingRight: 22,
                      paddingTop: 14,
                      paddingBottom: 14,
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
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-[18px]">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[12px] flex items-center"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.card,
                      padding: 10,
                      gap: 10,
                    }}
                  >
                    <div
                      className="grid place-items-center shrink-0 w-11 h-11 sm:w-14 sm:h-14"
                      style={{
                        borderRadius: 12,
                        color: s.iconColor,
                        background: s.iconBg,
                      }}
                    >
                      <Icon size={22} strokeWidth={1.8} className="sm:hidden" />
                      <Icon
                        size={26}
                        strokeWidth={1.8}
                        className="hidden sm:block"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-bold leading-none"
                        style={{
                          fontSize: "clamp(22px, 3vw, 34px)",
                          color: C.heading,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          fontSize: "clamp(11px, 1.3vw, 15px)",
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
              <RecentMysteries />

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                          display: "flex",
                          gap: 10,
                          padding: "12px 10px 12px 10px",
                          color: C.heading,
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(a.path)}
                      >
                        <div
                          className="grid place-items-center shrink-0 w-10 h-10 sm:w-12 sm:h-12"
                          style={{
                            borderRadius: 12,
                            background: S.iconBg,
                            color: S.iconColor,
                          }}
                        >
                          <Icon
                            size={20}
                            strokeWidth={1.8}
                            className="sm:hidden"
                          />
                          <Icon
                            size={24}
                            strokeWidth={1.8}
                            className="hidden sm:block"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-bold"
                            style={{
                              fontSize: 13,
                              marginTop: 6,
                              lineHeight: "18px",
                              whiteSpace: "normal",
                              color: C.heading,
                            }}
                          >
                            {a.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              lineHeight: "18px",
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
            <FeaturedTemplates />
          </div>
        </main>
      </div>
    </div>
  );
}
