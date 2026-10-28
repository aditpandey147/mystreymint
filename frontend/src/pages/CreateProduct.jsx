// frontend/src/pages/CreateProduct.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createMysteryBg from "../assets/images/createvideo-banner-bg.png";
import {
  Users,
  ArrowRight,
  Loader2,
  Sparkles,
  Hourglass,
  Calendar,
  Zap,
  ChevronDown,
  Dices,
  Drama,
  Building2,
  ChartNoAxesColumn,
  Clock,
  UsersRound,
  Gift,
  PlayCircle,
  Star,
  BookOpen,
  Search,
  Puzzle,
  Package,
  FileText,
  KeyRound,
  Image,
  Lightbulb,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";

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
  cyan: "#00D4D9",
  cyanHover: "#3EE4E8",
  heading: "#F5F5F3",
  secondary: "#AAB3B9",
  muted: "#707F88",
  border: "#29414C",
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean.startsWith("/mystery-templates/")) return clean;
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// STATIC DATA (fallback dropdown values)
// ================================================================
const GENRES = [
  "Murder Mystery",
  "Detective Mystery",
  "Treasure Hunt",
  "Spy Thriller",
  "Horror Mystery",
  "Sci-Fi Mystery",
];

const SETTINGS = [
  "Luxury Hotel",
  "Cruise Ship",
  "Country Manor",
  "Modern City",
  "Other",
];

const DIFFICULTIES = ["Medium", "Easy", "Hard"];
const PLAYER_COUNTS = ["4 - 8 Players", "2 - 4 Players", "8 - 12 Players"];
const DURATIONS = ["60 - 90 Minutes", "30 - 60 Minutes", "90 - 120 Minutes"];
const AUDIENCES = ["Adults (16+)", "Families", "Kids (8+)"];

const OUTPUTS = [
  "Mystery Story PDF",
  "Cover Image",
  "Suspect Cards",
  "Clues & Evidence",
  "Puzzle Sheets",
  "Solution Guide",
];

// ================================================================
// SELECT FIELD
// ================================================================
function SelectField({ label, icon: Icon, value, onChange, options }) {
  return (
    <div>
      <label
        className="block mb-2"
        style={{ fontSize: 13, fontWeight: 600, color: C.heading }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: C.gold }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none outline-none transition-colors"
          style={{
            height: 44,
            border: `1px solid ${C.border}`,
            background: C.input,
            borderRadius: 8,
            color: C.heading,
            padding: "0 40px 0 48px",
            fontSize: 13,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.gold)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        >
          {options.map((o) => (
            <option
              key={o}
              value={o}
              style={{ background: C.card, color: C.heading }}
            >
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: C.gold }}
        />
      </div>
    </div>
  );
}

// ================================================================
// RATE LIMIT MODAL
// ================================================================
function RateLimitModal({ info, onClose, onChangeTemplate }) {
  const [secondsLeft, setSecondsLeft] = useState(info?.waitSeconds || 0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!info) return;
    setSecondsLeft(info.waitSeconds || 0);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [info]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!info) return null;

  const reasonMeta = {
    cooldown: {
      Icon: Hourglass,
      color: C.gold,
      accent: "rgba(246,197,93,.5)",
      glow: "rgba(246,197,93,.15)",
      title: "Almost Ready, Creator",
      subtitle: "A quick pause keeps the quality high.",
    },
    daily_limit: {
      Icon: Calendar,
      color: C.cyan,
      accent: "rgba(0,212,217,.5)",
      glow: "rgba(0,212,217,.15)",
      title: "That's A Wrap For Today",
      subtitle: "You've had a fantastic creative day.",
    },
    window_limit: {
      Icon: Zap,
      color: C.goldHover,
      accent: "rgba(255,211,109,.5)",
      glow: "rgba(255,211,109,.15)",
      title: "Fresh Slots Loading",
      subtitle: "New creative space is on the way.",
    },
  };

  const meta = reasonMeta[info.reason] || reasonMeta.cooldown;
  const { Icon, color, accent, glow, title, subtitle } = meta;

  const formatTime = (sec) => {
    if (sec <= 0) return "Ready now";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
    return `${s}s`;
  };

  const total = info.waitSeconds || 1;
  const progress = Math.max(0, Math.min(1, (total - secondsLeft) / total));

  const ringSize = 120;
  const stroke = 6;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

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
        className="relative w-full max-w-[480px] rounded-[20px] overflow-hidden"
        style={{
          background: C.card,
          border: `1px solid ${accent}`,
          boxShadow: `0 30px 100px rgba(0,0,0,.8), 0 0 60px ${glow}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid place-items-center w-8 h-8 rounded-full transition-colors"
          style={{ color: C.secondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.input)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-7 pt-8 pb-7 text-center">
          <div
            className="relative mx-auto mb-6"
            style={{ width: ringSize, height: ringSize }}
          >
            <svg
              width={ringSize}
              height={ringSize}
              style={{ transform: "rotate(-90deg)", overflow: "visible" }}
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="rgba(41,65,76,.6)"
                strokeWidth={stroke}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: "stroke-dashoffset 1s linear",
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
            </svg>
            <div
              className="absolute inset-3 rounded-full grid place-items-center"
              style={{
                background: `radial-gradient(circle, ${glow}, transparent 70%)`,
              }}
            >
              <Icon size={36} strokeWidth={1.8} style={{ color }} />
            </div>
          </div>

          <h3
            className="text-[20px] font-semibold mb-1.5"
            style={{ color: C.heading }}
          >
            {title}
          </h3>
          <p className="text-[12.5px] mb-5" style={{ color: C.secondary }}>
            {subtitle}
          </p>

          <div
            className="rounded-[14px] px-5 py-4 mb-5"
            style={{ background: C.input, border: `1px solid ${C.border}` }}
          >
            <div
              className="text-[10px] uppercase tracking-[1.4px] font-semibold mb-1.5"
              style={{ color: C.secondary }}
            >
              {secondsLeft > 0 ? "Available in" : "Ready to create"}
            </div>
            <div
              className="text-[26px] font-bold tabular-nums"
              style={{ color, textShadow: `0 0 20px ${glow}` }}
            >
              {formatTime(secondsLeft)}
            </div>
          </div>

          <p
            className="text-[12.5px] leading-[1.65] mb-6"
            style={{ color: C.secondary }}
          >
            {info.message}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onChangeTemplate}
              className="flex-1 h-[44px] rounded-[11px] text-[12.5px] font-medium transition-all"
              style={{
                border: `1px solid ${C.border}`,
                background: C.input,
                color: C.heading,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.cardSecondary)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = C.input)}
            >
              Browse Templates
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-[44px] rounded-[11px] text-[12.5px] font-semibold transition-all hover:brightness-110"
              style={{
                background: C.goldGradient,
                color: C.mainBg,
                border: `1px solid ${C.goldHover}`,
                boxShadow: "inset 0 1px 1px rgba(255,255,255,.2)",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// GENERATION LOADER
// ================================================================
function GenerationLoader({ title, stage }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(t);
  }, []);

  const isSuccess = stage === "success";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, rgba(246,197,93,.08), transparent 60%), rgba(0,12,22,.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="w-full max-w-[480px] text-center">
        <div
          className="relative mx-auto mb-8 grid place-items-center"
          style={{ width: 130, height: 130 }}
        >
          {!isSuccess ? (
            <>
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: "3px solid rgba(246,197,93,.15)",
                  borderTopColor: C.gold,
                  animationDuration: "1.2s",
                }}
              />
              <div
                className="absolute inset-3 rounded-full animate-spin"
                style={{
                  border: "3px solid rgba(183,123,50,.15)",
                  borderTopColor: C.darkGold,
                  animationDuration: "1.6s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute inset-7 rounded-full grid place-items-center"
                style={{
                  background:
                    "radial-gradient(circle, rgba(246,197,93,.35), transparent 70%)",
                }}
              >
                <Sparkles
                  size={38}
                  className="animate-pulse"
                  style={{ color: C.goldHover }}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,212,217,.28), transparent 70%)",
                  animation: "successPulse 1.6s ease-in-out infinite",
                }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${C.goldHover}, ${C.gold})`,
                  boxShadow: `0 0 40px rgba(246,197,93,.6)`,
                  animation: "successPop .5s cubic-bezier(.2,.7,.3,1) both",
                }}
              />
              <div className="relative grid place-items-center">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.mainBg}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M4 12.5 9.5 18 20 7"
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: 30,
                      animation:
                        "checkDraw .6s cubic-bezier(.2,.7,.3,1) .35s forwards",
                    }}
                  />
                </svg>
              </div>
            </>
          )}
        </div>

        {!isSuccess ? (
          <>
            <h2
              className="font-['Playfair_Display',Georgia,serif] font-bold mb-3"
              style={{ fontSize: "clamp(24px, 3vw, 32px)", color: C.heading }}
            >
              Generation in Progress{dots}
            </h2>

            <p
              className="mb-7 leading-[1.6]"
              style={{ fontSize: 14.5, color: C.secondary }}
            >
              {title ? (
                <>
                  <strong style={{ color: C.gold }}>{title}</strong> is being
                  crafted. This usually takes 2–4 minutes.
                </>
              ) : (
                "Your mystery is being crafted. This usually takes 2–4 minutes."
              )}
            </p>

            <div
              className="h-[5px] rounded-full overflow-hidden mb-6"
              style={{ background: "rgba(41,65,76,.5)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${C.darkGold}, ${C.gold}, ${C.goldHover}, ${C.gold}, ${C.darkGold})`,
                  backgroundSize: "200% 100%",
                  animation: "shimmerMove 2s linear infinite",
                  width: "100%",
                }}
              />
            </div>

            <p
              className="leading-[1.5]"
              style={{ fontSize: 12, color: C.secondary }}
            >
              Taking you to My Mysteries…
              <br />
              You can watch live progress there.
            </p>
          </>
        ) : (
          <>
            <h2
              className="font-['Playfair_Display',Georgia,serif] font-bold mb-3"
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                color: C.heading,
                animation: "successFadeUp .5s cubic-bezier(.2,.7,.3,1) both",
              }}
            >
              Generation Started
            </h2>

            <p
              className="mb-7 leading-[1.6]"
              style={{
                fontSize: 14.5,
                color: C.secondary,
                animation:
                  "successFadeUp .5s cubic-bezier(.2,.7,.3,1) .15s both",
              }}
            >
              Your mystery is being generated in the background.
              <br />
              Redirecting to My Mysteries…
            </p>

            <div
              className="h-[5px] rounded-full overflow-hidden mb-6"
              style={{ background: "rgba(41,65,76,.5)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${C.cyan}, ${C.cyanHover})`,
                  boxShadow: `0 0 12px rgba(0,212,217,.7)`,
                  width: "100%",
                  animation: "successBar 1.4s ease-out forwards",
                }}
              />
            </div>

            <p
              className="leading-[1.5]"
              style={{
                fontSize: 12,
                color: C.secondary,
                animation: "successFadeUp .5s .3s both",
              }}
            >
              Watch live progress on the next page.
            </p>
          </>
        )}

        <style>{`
          @keyframes shimmerMove {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          @keyframes successPop {
            0%   { transform: scale(.3); opacity: 0; }
            60%  { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes successPulse {
            0%, 100% { transform: scale(1); opacity: .8; }
            50%      { transform: scale(1.1); opacity: 1; }
          }
          @keyframes checkDraw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes successFadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes successBar {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ================================================================
// TEMPLATE PICKER CARD
// ================================================================
function TemplateCard({ template, isSelected, onClick }) {
  const cover = template.thumbnail
    ? getImageUrl(template.thumbnail)
    : template.coverImage
      ? getImageUrl(template.coverImage)
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left relative overflow-hidden transition-all hover:-translate-y-[1px]"
      style={{
        border: isSelected ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
        borderRadius: 10,
        background: C.input,
        color: C.heading,
        padding: 0,
        cursor: "pointer",
        boxShadow: isSelected
          ? `0 0 0 2px ${C.gold}33, 0 4px 12px rgba(246,197,93,.15)`
          : "none",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative"
        style={{
          height: 90,
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
            className="w-full h-full object-cover"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <Sparkles size={22} style={{ color: C.gold, opacity: 0.4 }} />
          </div>
        )}

        {template.isFeatured && (
          <span
            className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              background: C.gold,
              color: C.mainBg,
              fontSize: 8.5,
              fontWeight: 700,
            }}
          >
            <Star size={8} fill={C.mainBg} />
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "8px 10px" }}>
        <div
          className="font-bold truncate"
          style={{ fontSize: 12, color: C.heading }}
          title={template.name}
        >
          {template.name}
        </div>
        <div
          className="mt-1 truncate"
          style={{ fontSize: 11, color: C.secondary }}
          title={template.genre}
        >
          {template.genre}
        </div>
      </div>

      {isSelected && (
        <span
          className="absolute grid place-items-center rounded-full"
          style={{
            right: 6,
            top: 6,
            width: 22,
            height: 22,
            background: C.gold,
            color: C.mainBg,
            fontWeight: 700,
            fontSize: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,.5)",
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  const { templateId: preTemplateId = null, template: preTemplate = null } =
    location.state || {};

  // ---- Form state ----
  const [mysteryTitle, setMysteryTitle] = useState(preTemplate?.name || "");
  const [genre, setGenre] = useState(preTemplate?.genre || GENRES[0]);
  const [setting, setSetting] = useState(preTemplate?.setting || SETTINGS[0]);
  const [difficulty, setDifficulty] = useState(
    preTemplate?.difficulty || DIFFICULTIES[0],
  );
  const [players, setPlayers] = useState(
    preTemplate?.playerCount
      ? `${preTemplate.playerCount} Players`
      : PLAYER_COUNTS[0],
  );
  const [duration, setDuration] = useState(
    preTemplate?.duration
      ? `${preTemplate.duration} - ${preTemplate.duration + 30} Minutes`
      : DURATIONS[0],
  );
  const [audience, setAudience] = useState(
    preTemplate?.targetAudience || AUDIENCES[0],
  );
  const [storyIdea, setStoryIdea] = useState(preTemplate?.storyIdea || "");

  // ---- Templates from API ----
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(preTemplateId);

  const OUTPUTS = [
    { label: "Mystery Story PDF", Icon: BookOpen },
    { label: "Cover Image", Icon: Image },
    { label: "Suspect Cards", Icon: Users },
    { label: "Clues & Evidence", Icon: Search },
    { label: "Puzzle Sheets", Icon: Puzzle },
    { label: "Solution Guide", Icon: KeyRound },
  ];

  // ---- Generation state ----
  const [generating, setGenerating] = useState(false);
  const [loaderStage, setLoaderStage] = useState("loading");
  const [rateLimit, setRateLimit] = useState(null);

  // ================================================================
  // FETCH TEMPLATES
  // ================================================================
  useEffect(() => {
    let cancelled = false;
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const res = await api.get("/templates");
        if (!cancelled && res.data?.success) {
          const list = res.data.data || [];
          // Show 8 templates (featured first)
          const sorted = [...list].sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return (a.order || 0) - (b.order || 0);
          });
          setTemplates(sorted.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    };
    fetchTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  // ================================================================
  // APPLY TEMPLATE → AUTO-FILL ALL FIELDS
  // ================================================================
  const applyTemplate = (template) => {
    // Toggle deselect
    if (selectedTemplateId === template._id) {
      setSelectedTemplateId(null);
      setSelectedTemplate(null);
      return;
    }

    setSelectedTemplateId(template._id);
    setSelectedTemplate(template);

    // Auto-fill every field
    if (template.name) setMysteryTitle(template.name);

    if (template.genre && GENRES.includes(template.genre)) {
      setGenre(template.genre);
    } else if (template.genre) {
      // If genre not in list, still set it (select will show a fallback)
      setGenre(template.genre);
    }

    if (template.setting) setSetting(template.setting);

    if (template.difficulty && DIFFICULTIES.includes(template.difficulty)) {
      setDifficulty(template.difficulty);
    }

    if (template.playerCount) {
      // Convert "4-8" → "4 - 8 Players"
      const clean = template.playerCount.replace(/-/g, " - ").trim();
      const withPlayers = /player/i.test(clean) ? clean : `${clean} Players`;
      setPlayers(withPlayers);
    }

    if (template.duration) {
      const num = Number(template.duration);
      setDuration(`${num} - ${num + 30} Minutes`);
    }

    if (template.targetAudience) {
      // "Adults" → "Adults (16+)"
      const audienceMap = {
        Adults: "Adults (16+)",
        Families: "Families",
        Kids: "Kids (8+)",
      };
      setAudience(
        audienceMap[template.targetAudience] || template.targetAudience,
      );
    }

    if (template.storyIdea) {
      setStoryIdea(template.storyIdea);
    }

    toast.success(`Template "${template.name}" applied`);
  };

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = () => {
    if (!mysteryTitle.trim()) {
      toast.error("Please enter a mystery title");
      return;
    }
    if (generating) return;

    setGenerating(true);
    setLoaderStage("loading");

    const durationNumber = parseInt(String(duration).split("-")[0]) || 60;
    const playerCountClean = players.replace(/\s*Players?/i, "").trim();
    const audienceClean = audience.replace(/\s*\(.*\)/, "").trim();

    const payload = {
      title: mysteryTitle.trim(),
      genre,
      setting,
      difficulty,
      playerCount: playerCountClean,
      duration: durationNumber,
      targetAudience: audienceClean,
      storyIdea: storyIdea.trim(),
      templateId: selectedTemplateId || null,
      includeImages: true,
    };

    api
      .post("/mysteries/generate", payload)
      .then((res) => {
        if (res.data?.success) {
          console.log("✅ Mystery queued:", res.data.mysteryId);
        }
      })
      .catch((err) => {
        console.error("❌ Generation request failed:", err);

        if (err.response?.status === 429 && err.response?.data?.rateLimited) {
          toast.error(
            err.response.data.message ||
              "Rate limit reached. Try again in a moment.",
            { duration: 6000 },
          );
          return;
        }

        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Generation failed to start",
          { duration: 6000 },
        );
      });

    setTimeout(() => {
      setLoaderStage("success");

      setTimeout(() => {
        toast.success("Generation started — check My Mysteries");
        navigate("/my-mysteries");
      }, 2000);
    }, 8000);
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

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1650px] mx-auto px-5 py-5">
            {/* HERO */}
            <section
              className="relative overflow-hidden rounded-[12px] mb-4 py-[42px] px-[30px] min-h-[340px]"
              style={{ background: "#000000" }}
            >
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{ backgroundImage: `url(${createMysteryBg})` }}
              />
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.35)_82%,rgba(0,0,0,.15)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.45))]" />

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
                  Create a New Mystery
                </div>

                <h1
                  className="font-['Playfair_Display',Georgia,serif] mb-3"
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.5px",
                    fontWeight: 500,
                    color: "#ffffff",
                  }}
                >
                  Bring Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Mystery
                  </em>
                  <br />
                  to Life{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    With AI
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[620px] mb-[22px]"
                  style={{
                    fontSize: "clamp(14px,1.6vw,17px)",
                    color: C.heading,
                  }}
                >
                  Use AI to create a complete, ready-to-play mystery game with
                  characters, clues,
                  <br className="hidden xl:block" /> puzzles, evidence and more.
                  Just fill in the details and let the AI do the work.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center h-[50px] px-[24px] gap-3 text-[15px] font-bold rounded-[11px] transition-all hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: C.goldGradient,
                      color: C.mainBg,
                      border: `1px solid ${C.goldHover}`,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                    }}
                  >
                    <Sparkles size={17} />
                    Generate My Mystery
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/templates")}
                    className="flex items-center h-[50px] px-[22px] gap-2.5 text-[14px] font-semibold rounded-[11px] transition-all hover:-translate-y-[1px]"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      color: C.heading,
                      border: "1px solid rgba(255,255,255,.18)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    <PlayCircle size={17} style={{ color: C.gold }} />
                    Browse All Templates
                  </button>
                </div>
              </div>
            </section>

            {/* 2-COLUMN CONTENT */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(440px,0.93fr)_minmax(520px,1.07fr)] gap-4">
              {/* LEFT — MYSTERY DETAILS */}
              <section
                className="rounded-[12px]"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  padding: 18,
                }}
              >
                <div className="flex items-center gap-3.5 mb-[18px]">
                  <span
                    className="grid place-items-center shrink-0 rounded-full font-bold"
                    style={{
                      width: 35,
                      height: 35,
                      color: C.mainBg,
                      background: C.goldGradient,
                      border: `1px solid ${C.goldHover}`,
                      fontSize: 17,
                    }}
                  >
                    1
                  </span>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      Mystery Details
                    </h2>
                    <p
                      className="mt-1"
                      style={{ fontSize: 13, color: C.secondary }}
                    >
                      Tell us what kind of mystery you want to create.
                    </p>
                  </div>
                </div>

                <label
                  className="block mb-2"
                  style={{ fontSize: 13, fontWeight: 600, color: C.heading }}
                >
                  Mystery Title
                </label>
                <div className="relative mb-5">
                  <input
                    type="text"
                    value={mysteryTitle}
                    onChange={(e) => setMysteryTitle(e.target.value)}
                    className="w-full outline-none transition-colors"
                    placeholder="♙ e.g. Murder at the Grand Hotel"
                    style={{
                      height: 44,
                      border: `1px solid ${C.border}`,
                      background: C.input,
                      borderRadius: 8,
                      color: C.heading,
                      padding: "0 13px",
                      fontSize: 13,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.gold)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                  <Dices
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: C.gold }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                  <SelectField
                    label="Genre"
                    icon={Drama}
                    value={genre}
                    onChange={setGenre}
                    options={
                      GENRES.includes(genre) ? GENRES : [genre, ...GENRES]
                    }
                  />
                  <SelectField
                    label="Setting"
                    icon={Building2}
                    value={setting}
                    onChange={setSetting}
                    options={
                      SETTINGS.includes(setting)
                        ? SETTINGS
                        : [setting, ...SETTINGS]
                    }
                  />
                  <SelectField
                    label="Difficulty Level"
                    icon={ChartNoAxesColumn}
                    value={difficulty}
                    onChange={setDifficulty}
                    options={DIFFICULTIES}
                  />
                  <SelectField
                    label="Player Count"
                    icon={Users}
                    value={players}
                    onChange={setPlayers}
                    options={
                      PLAYER_COUNTS.includes(players)
                        ? PLAYER_COUNTS
                        : [players, ...PLAYER_COUNTS]
                    }
                  />
                  <SelectField
                    label="Game Duration"
                    icon={Clock}
                    value={duration}
                    onChange={setDuration}
                    options={
                      DURATIONS.includes(duration)
                        ? DURATIONS
                        : [duration, ...DURATIONS]
                    }
                  />
                  <SelectField
                    label="Target Audience"
                    icon={UsersRound}
                    value={audience}
                    onChange={setAudience}
                    options={
                      AUDIENCES.includes(audience)
                        ? AUDIENCES
                        : [audience, ...AUDIENCES]
                    }
                  />
                </div>

                <div className="flex items-center gap-3.5 mt-8 mb-[18px]">
                  <span
                    className="grid place-items-center shrink-0 rounded-full font-bold"
                    style={{
                      width: 35,
                      height: 35,
                      color: C.mainBg,
                      background: C.goldGradient,
                      border: `1px solid ${C.goldHover}`,
                      fontSize: 17,
                    }}
                  >
                    2
                  </span>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      Story Preferences
                    </h2>
                    <p
                      className="mt-1"
                      style={{ fontSize: 13, color: C.secondary }}
                    >
                      Customize your mystery story.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={storyIdea}
                    onChange={(e) => setStoryIdea(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={`Add your idea or special requirements (optional)\ne.g. I want a mystery where a famous actor is found dead during a film festival...`}
                    className="w-full outline-none resize-none transition-colors"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.input,
                      borderRadius: 8,
                      color: C.heading,
                      padding: "12px 13px",
                      fontSize: 13,
                      minHeight: 106,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.gold)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                  <span
                    className="absolute bottom-3 right-3"
                    style={{ fontSize: 11, color: C.secondary }}
                  >
                    {storyIdea.length}/500
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full mt-6 flex items-center justify-center gap-3 rounded-[9px] transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    height: 53,
                    background: C.goldGradient,
                    border: `1px solid ${C.goldHover}`,
                    color: C.mainBg,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.3)",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate My Mystery
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p
                  className="mt-3"
                  style={{ fontSize: 11, color: C.secondary }}
                >
                  You will get a complete mystery game kit with story,
                  characters, clues, puzzles, evidence and solution.
                </p>
              </section>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-4">
                {/* Step 3 — Templates from DB */}
                <section
                  className="rounded-[12px]"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    padding: 18,
                  }}
                >
                  <div className="flex justify-between items-start sm:items-center mb-5 gap-3 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <span
                        className="grid place-items-center shrink-0 rounded-full font-bold"
                        style={{
                          width: 35,
                          height: 35,
                          color: C.mainBg,
                          background: C.goldGradient,
                          border: `1px solid ${C.goldHover}`,
                          fontSize: 17,
                        }}
                      >
                        3
                      </span>
                      <div>
                        <h2
                          className="font-bold"
                          style={{ fontSize: 16, color: C.heading }}
                        >
                          Choose a Template (Optional)
                        </h2>
                        <p
                          className="mt-1"
                          style={{ fontSize: 13, color: C.secondary }}
                        >
                          Click a template to auto-fill every field below.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/templates")}
                      className="whitespace-nowrap transition"
                      style={{
                        color: C.gold,
                        fontSize: 12.5,
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      View All
                    </button>
                  </div>

                  {templatesLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-[10px]"
                          style={{
                            background: C.input,
                            border: `1px solid ${C.border}`,
                            height: 140,
                          }}
                        />
                      ))}
                    </div>
                  ) : templates.length === 0 ? (
                    <div
                      className="rounded-[10px] p-6 text-center"
                      style={{
                        background: C.input,
                        border: `1px dashed ${C.border}`,
                      }}
                    >
                      <p style={{ fontSize: 12.5, color: C.secondary }}>
                        No templates available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {templates.map((t) => (
                        <TemplateCard
                          key={t._id}
                          template={t}
                          isSelected={selectedTemplateId === t._id}
                          onClick={() => applyTemplate(t)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* What You'll Get */}

                <section
                  className="rounded-[12px]"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    padding: 18,
                  }}
                >
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <h2
                      className="flex items-center gap-3 font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      <Gift size={20} style={{ color: C.gold }} />
                      What You&apos;ll Get
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                    {OUTPUTS.map(({ label, Icon }, i) => (
                      <div key={i}>
                        <div
                          className="grid place-items-center"
                          style={{
                            height: 90,
                            borderRadius: 8,
                            background: C.input,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <Icon
                            size={28}
                            strokeWidth={1.6}
                            style={{ color: C.gold, opacity: 0.85 }}
                          />
                        </div>
                        <div
                          className="text-center mt-2.5 leading-[17px]"
                          style={{ fontSize: 11, color: C.heading }}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      {generating && (
        <GenerationLoader title={mysteryTitle} stage={loaderStage} />
      )}

      {rateLimit && (
        <RateLimitModal
          info={rateLimit}
          onClose={() => setRateLimit(null)}
          onChangeTemplate={() => {
            setRateLimit(null);
            navigate("/templates");
          }}
        />
      )}
    </div>
  );
}
