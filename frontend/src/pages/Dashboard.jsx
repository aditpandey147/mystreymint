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
// RECENT MYSTERIES
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
      <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
        <h2
          className="font-bold m-0"
          style={{
            fontSize: "clamp(16px, 4vw, 21px)",
            color: C.heading,
          }}
        >
          Recent Mysteries
        </h2>
        <button
          type="button"
          onClick={() => navigate("/my-mysteries")}
          className="font-semibold transition shrink-0"
          style={{
            color: C.gold,
            fontSize: "clamp(12px, 3.2vw, 14px)",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            whiteSpace: "nowrap",
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
        <div className="py-8 text-center">
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
          <p
            style={{
              fontSize: "clamp(12px, 3.2vw, 14px)",
              color: C.secondary,
              marginBottom: 14,
            }}
          >
            No mysteries yet
          </p>
          <button
            onClick={() => navigate("/create-mystery")}
            className="inline-flex items-center gap-2 h-[40px] px-4 rounded-[10px] text-[12.5px] font-bold"
            style={{
              background: C.goldGradient,
              color: C.mainBg,
              border: `1px solid ${C.goldHover}`,
            }}
          >
            <Plus size={13} />
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
              className="flex items-start"
              style={{
                gap: "clamp(8px, 2.5vw, 16px)",
                borderTop: `1px solid ${C.border}`,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {/* Cover thumbnail */}
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: "clamp(56px, 16vw, 100px)",
                  height: "clamp(40px, 11vw, 66px)",
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
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <FileText
                      size={18}
                      style={{ color: C.gold, opacity: 0.5 }}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-bold truncate"
                  style={{
                    fontSize: "clamp(12px, 3.4vw, 16px)",
                    marginBottom: 6,
                    color: C.heading,
                  }}
                  title={m.title}
                >
                  {m.title}
                </div>
                <div
                  className="flex items-center flex-wrap"
                  style={{ gap: "clamp(4px, 1.5vw, 12px)", fontSize: 12 }}
                >
                  <span
                    className="rounded-full truncate"
                    style={{
                      padding: "3px 8px",
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
                      fontSize: "clamp(9px, 2.4vw, 12px)",
                      maxWidth: "100%",
                    }}
                  >
                    {m.genre || "Mystery"}
                  </span>
                  <span
                    className="flex items-center whitespace-nowrap"
                    style={{
                      color: C.secondary,
                      gap: 4,
                      fontSize: "clamp(9px, 2.4vw, 12px)",
                    }}
                  >
                    <UsersRound size={10} /> {m.playerCount || "—"}
                  </span>
                  <span
                    className="flex items-center whitespace-nowrap"
                    style={{
                      color: C.secondary,
                      gap: 4,
                      fontSize: "clamp(9px, 2.4vw, 12px)",
                    }}
                  >
                    <Clock size={10} />{" "}
                    {m.duration ? `${m.duration}m` : "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/mystery/${m._id}`)}
                className="shrink-0 transition-all"
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.input,
                  color: C.gold,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontWeight: 600,
                  fontSize: "clamp(10px, 2.6vw, 13px)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  alignSelf: "center",
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
          );
        })
      )}
    </div>
  );
}

// ================================================================
// FEATURED TEMPLATES
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
      <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
        <h2
          className="font-bold m-0"
          style={{ fontSize: "clamp(16px, 4vw, 21px)", color: C.heading }}
        >
          Featured Templates
        </h2>
        <button
          type="button"
          onClick={() => navigate("/templates")}
          className="font-semibold transition shrink-0"
          style={{
            color: C.gold,
            fontSize: "clamp(12px, 3vw, 14px)",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.goldHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.gold)}
        >
          Browse All <span className="hidden sm:inline">Templates</span>{" "}
          <ArrowRight size={12} className="inline" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[10px]"
              style={{
                border: `1px solid ${C.border}`,
                background: C.cardSecondary,
                height: "clamp(120px, 32vw, 160px)",
              }}
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-6 text-center">
          <p style={{ fontSize: 12, color: C.secondary }}>
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
                        size={18}
                        style={{ color: C.gold, opacity: 0.5 }}
                      />
                    </div>
                  )}
                  {t.isFeatured && (
                    <span
                      className="absolute top-1 right-1 px-1 py-0.5 rounded-full"
                      style={{
                        background: C.gold,
                        color: C.mainBg,
                        fontSize: 8,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      ★
                    </span>
                  )}
                </div>

                <div style={{ padding: "6px 8px" }}>
                  <div
                    className="font-bold truncate"
                    style={{
                      fontSize: "clamp(10px, 2.8vw, 14px)",
                      color: C.heading,
                    }}
                    title={t.name}
                  >
                    {t.name}
                  </div>
                  <div
                    className="truncate"
                    style={{
                      fontSize: "clamp(9px, 2.4vw, 12px)",
                      color: C.secondary,
                      marginTop: 3,
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
            (m) => m.generationStatus === "completed"
          ).length;
          const generating = list.filter(
            (m) =>
              m.generationStatus === "generating" ||
              m.generationStatus === "pending" ||
              m.generationStatus === "validating"
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
      label: "Templates",
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

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen min-w-0">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: "clamp(12px, 3vw, 20px) clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px) clamp(12px, 3vw, 20px)",
          }}
        >
          <div className="max-w-[1650px] mx-auto min-w-0">
            {/* HERO */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-4"
              style={{
                background: "#000000",
                paddingTop: "clamp(24px, 5vw, 40px)",
                paddingBottom: "clamp(24px, 5vw, 40px)",
                minHeight: "clamp(280px, 50vw, 360px)",
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
                style={{
                  paddingLeft: "clamp(16px, 4vw, 29px)",
                  paddingRight: "clamp(16px, 4vw, 29px)",
                }}
              >
                <div
                  className="inline-flex items-center gap-2 mb-3"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "rgba(246,197,93,.12)",
                    border: `1px solid ${C.gold}55`,
                    color: C.gold,
                    fontSize: "clamp(9px, 2.4vw, 12px)",
                    fontWeight: 600,
                    letterSpacing: "clamp(0.8px, 0.3vw, 1.5px)",
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
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(22px, 6vw, 54px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    margin: "0 0 12px",
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
                    fontSize: "clamp(12px, 3vw, 19px)",
                    lineHeight: 1.6,
                    margin: "0 0 clamp(16px, 4vw, 24px)",
                    color: C.heading,
                    maxWidth: 620,
                  }}
                >
                  Stories, suspects, clues, puzzles and beautiful game kits
                  <br className="hidden sm:block" />— ready to play or sell.
                </p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate("/create-mystery")}
                    className="flex items-center transition-all hover:-translate-y-[1px]"
                    style={{
                      height: "clamp(42px, 10vw, 50px)",
                      paddingLeft: "clamp(14px, 3vw, 24px)",
                      paddingRight: "clamp(14px, 3vw, 24px)",
                      fontSize: "clamp(12px, 3vw, 16px)",
                      gap: "clamp(6px, 1.5vw, 14px)",
                      background: C.goldGradient,
                      color: "#000C16",
                      border: `1px solid ${C.goldHover}`,
                      borderRadius: 11,
                      fontWeight: 700,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.filter = "brightness(1.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.filter = "brightness(1)")
                    }
                  >
                    <Plus size={16} />
                    Create Mystery
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => navigate("/templates")}
                    className="flex items-center transition-all hover:-translate-y-[1px]"
                    style={{
                      height: "clamp(42px, 10vw, 50px)",
                      paddingLeft: "clamp(12px, 3vw, 22px)",
                      paddingRight: "clamp(12px, 3vw, 22px)",
                      fontSize: "clamp(11px, 2.8vw, 15px)",
                      gap: "clamp(5px, 1.2vw, 10px)",
                      background: "rgba(255,255,255,.06)",
                      color: C.heading,
                      border: "1px solid rgba(255,255,255,.18)",
                      borderRadius: 11,
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Templates
                  </button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[12px] flex items-center"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.card,
                      padding: "clamp(8px, 2.5vw, 12px)",
                      gap: "clamp(8px, 2vw, 14px)",
                      minWidth: 0,
                    }}
                  >
                    <div
                      className="grid place-items-center shrink-0"
                      style={{
                        width: "clamp(40px, 11vw, 56px)",
                        height: "clamp(40px, 11vw, 56px)",
                        borderRadius: "clamp(10px, 3vw, 14px)",
                        color: s.iconColor,
                        background: s.iconBg,
                      }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.8}
                        style={{
                          width: "clamp(18px, 5vw, 26px)",
                          height: "clamp(18px, 5vw, 26px)",
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-bold leading-none truncate"
                        style={{
                          fontSize: "clamp(18px, 5vw, 34px)",
                          color: C.heading,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="mt-1 truncate"
                        style={{
                          fontSize: "clamp(10px, 2.6vw, 15px)",
                          color: C.secondary,
                        }}
                        title={s.label}
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
            <section className="grid grid-cols-1 lg:grid-cols-[1.425fr_1fr] gap-3 sm:gap-4 mb-4">
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
                    style={{
                      fontSize: "clamp(16px, 4vw, 21px)",
                      color: C.heading,
                    }}
                  >
                    Quick Actions
                  </h2>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
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
                          minHeight: "clamp(88px, 22vw, 105px)",
                          display: "flex",
                          gap: "clamp(8px, 2vw, 14px)",
                          padding: "clamp(8px, 2vw, 12px)",
                          color: C.heading,
                          cursor: "pointer",
                          minWidth: 0,
                        }}
                        onClick={() => navigate(a.path)}
                      >
                        <div
                          className="grid place-items-center shrink-0"
                          style={{
                            width: "clamp(36px, 9vw, 48px)",
                            height: "clamp(36px, 9vw, 48px)",
                            borderRadius: "clamp(9px, 2.5vw, 13px)",
                            background: S.iconBg,
                            color: S.iconColor,
                          }}
                        >
                          <Icon
                            size={20}
                            strokeWidth={1.8}
                            style={{
                              width: "clamp(16px, 4.5vw, 24px)",
                              height: "clamp(16px, 4.5vw, 24px)",
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pr-4">
                          <div
                            className="font-bold truncate"
                            style={{
                              fontSize: "clamp(11px, 2.8vw, 14px)",
                              marginTop: "clamp(4px, 1.5vw, 10px)",
                              color: C.heading,
                            }}
                            title={a.title}
                          >
                            {a.title}
                          </div>
                          <div
                            className="truncate"
                            style={{
                              fontSize: "clamp(10px, 2.4vw, 13px)",
                              lineHeight: 1.4,
                              marginTop: 2,
                              color: C.secondary,
                            }}
                            title={a.desc.replace(/\n/g, " ")}
                          >
                            {a.desc.replace(/\n/g, " ")}
                          </div>
                        </div>
                        <ArrowRight
                          size={12}
                          style={{
                            position: "absolute",
                            bottom: "clamp(6px, 1.5vw, 10px)",
                            right: "clamp(8px, 2vw, 12px)",
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
