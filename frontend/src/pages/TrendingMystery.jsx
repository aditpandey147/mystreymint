// frontend/src/pages/TrendingMystery.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Search,
  Star,
  TrendingUp,
  Users,
  LayoutGrid,
  Sword,
  HatGlasses,
  LockKeyhole,
  Map,
  Smile,
  Gift,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  Loader2,
  Sparkles,
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
  card: "#031520",
  cardSecondary: "#0C1926",
  input: "#000611",
  gold: "#F6C55D",
  goldHover: "#FFD36D",
  darkGold: "#B77B32",
  cyan: "#00D4D9",
  heading: "#F5F5F3",
  secondary: "#AAB3B9",
  muted: "#707F88",
  border: "#29414C",
  rose: "#ff8fa8",
  green: "#00ed9e",
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
};

// ================================================================
// CATEGORY CONFIG
// ================================================================
const CATEGORIES = [
  { key: "All", label: "All", icon: LayoutGrid },
  { key: "Murder Mystery", label: "Murder Mystery", icon: Sword },
  { key: "Detective Case", label: "Detective Case", icon: HatGlasses },
  { key: "Escape Room", label: "Escape Room", icon: LockKeyhole },
  { key: "Party Game", label: "Party Game", icon: Users },
  { key: "Treasure Hunt", label: "Treasure Hunt", icon: Map },
  { key: "Kids & Family", label: "Kids & Family", icon: Smile },
  { key: "Holiday Special", label: "Holiday Special", icon: Gift },
];

const CATEGORY_COLORS = {
  "Murder Mystery": { border: "#fb1646", bg: "rgba(251,22,70,.1)" },
  "Detective Case": { border: "#1682ff", bg: "rgba(22,130,255,.1)" },
  "Treasure Hunt": { border: "#00c88a", bg: "rgba(0,200,138,.1)" },
  "Holiday Special": { border: "#8e4aff", bg: "rgba(142,74,255,.1)" },
  "Party Game": { border: "#ba8b23", bg: "rgba(186,139,35,.1)" },
  "Escape Room": { border: "#8048ff", bg: "rgba(128,72,255,.1)" },
  "Kids & Family": { border: "#f03fda", bg: "rgba(240,63,218,.1)" },
  Adventure: { border: "#00c88a", bg: "rgba(0,200,138,.1)" },
};

const DIFFICULTY_COLORS = {
  Easy: { border: "#00c58b", bg: "rgba(0,197,139,.1)", text: "#b9fff1" },
  Medium: { border: "#b68b1a", bg: "rgba(182,139,26,.1)", text: "#ffdb51" },
  Hard: { border: "#fc194b", bg: "rgba(252,25,75,.1)", text: "#fff" },
};

// ================================================================
// MAIN PAGE
// ================================================================
export default function TrendingMystery() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [period, setPeriod] = useState("This Month");
  const [difficulty, setDifficulty] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // ================================================================
  // SEARCH — call backend which calls DeepSeek
  // ================================================================
  const handleSearch = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setAppliedQuery(searchInput.trim());

      toast.loading("Generating trending ideas…", { id: "gen-ideas" });

      const res = await api.post(
        "/trending/search",
        {
          query: searchInput.trim(),
          category: activeCategory,
          difficulty,
        },
        { timeout: 90000 }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to generate ideas");
      }

      setIdeas(res.data.data || []);
      toast.success(`${res.data.count} ideas generated!`, { id: "gen-ideas" });
    } catch (err) {
      console.error("Search failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate ideas";
      setError(msg);
      setIdeas([]);
      toast.error(msg, { id: "gen-ideas" });
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // FILTER + SORT (client-side on AI results)
  // ================================================================
  const filtered = useMemo(() => {
    let list = [...ideas];

    if (activeCategory !== "All") {
      list = list.filter((i) => i.category === activeCategory);
    }

    if (difficulty !== "All Levels") {
      list = list.filter((i) => i.difficulty === difficulty);
    }

    if (sortBy === "Most Searches") {
      list.sort(
        (a, b) =>
          parseFloat(b.searches.replace("K", "")) -
          parseFloat(a.searches.replace("K", ""))
      );
    } else if (sortBy === "Highest Growth") {
      list.sort((a, b) => b.growth - a.growth);
    } else {
      list.sort((a, b) => b.popularity - a.popularity);
    }

    return list;
  }, [ideas, activeCategory, difficulty, sortBy]);

  // ================================================================
  // USE IDEA
  // ================================================================
  const handleUseIdea = (idea) => {
    navigate("/create-mystery", {
      state: {
        ideaPrefill: {
          title: idea.title,
          genre: idea.genre,
          setting: idea.setting,
          difficulty: idea.difficulty,
          playerCount: idea.playerCount,
          duration: idea.duration,
          targetAudience: idea.targetAudience,
          storyIdea: idea.storyIdea,
        },
      },
    });
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
            {/* ========== HEADING ========== */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div>
                <h1
                  className="font-['Playfair_Display',Georgia,serif] font-bold mb-2"
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.5px",
                    color: C.heading,
                  }}
                >
                  Trending{" "}
                  <span style={{ color: C.gold }}>Mystery Ideas</span>
                </h1>
                <p style={{ fontSize: 15, color: C.secondary }}>
                  Search any topic — AI generates 10 fresh mystery ideas
                  instantly.
                </p>
              </div>
            </div>

            {/* ========== SEARCH BAR ========== */}
            <div
              className="rounded-[12px] p-5 mb-5"
              style={{
                background: C.card,
                border: `1px solid ${C.gold}55`,
                boxShadow: `0 0 40px rgba(246,197,93,.08)`,
              }}
            >
              <label
                className="block mb-2 text-[12px] font-bold uppercase tracking-wider"
                style={{ color: C.gold }}
              >
                Search Mystery Ideas
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Sparkles
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: C.gold }}
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="e.g. 1920s, haunted house, treasure hunt, space station, Christmas…"
                    className="w-full outline-none"
                    style={{
                      height: 54,
                      border: `1px solid ${C.border}`,
                      background: C.input,
                      borderRadius: 11,
                      color: C.heading,
                      padding: "0 16px 0 46px",
                      fontSize: 14,
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = C.gold)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = C.border)
                    }
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 h-[54px] px-7 rounded-[11px] text-[14px] font-bold transition-all hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 whitespace-nowrap"
                  style={{
                    background: C.goldGradient,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Finding…
                    </>
                  ) : (
                    <>
                      <Search size={17} />
                      Find Ideas
                    </>
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: C.secondary,
                  marginTop: 10,
                }}
              >
                Press Enter or click Generate Ideas — takes 20-40 seconds for
                10 fresh AI ideas.
              </p>
            </div>

            {/* ========== STATS ========== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <StatCard
                icon={Flame}
                value={ideas.length > 0 ? String(ideas.length) : "—"}
                label="Ideas Generated"
                growth={hasSearched ? "from this search" : "search to begin"}
                color="#fb365d"
                bg="rgba(251,54,93,.15)"
              />
              <StatCard
                icon={TrendingUp}
                value={
                  ideas.length > 0
                    ? `${Math.round(
                        ideas.reduce((s, i) => s + i.growth, 0) /
                          ideas.length
                      )}%`
                    : "—"
                }
                label="Avg. Growth"
                growth="across all ideas"
                color="#7549fa"
                bg="rgba(117,73,250,.15)"
              />
              <StatCard
                icon={Star}
                value={
                  ideas.length > 0
                    ? (
                        ideas.reduce((s, i) => s + i.popularity, 0) /
                        ideas.length /
                        20
                      ).toFixed(1)
                    : "—"
                }
                label="Avg. Popularity"
                growth="out of 5.0"
                color="#ffcf30"
                bg="rgba(255,207,48,.15)"
              />
              <StatCard
                icon={Users}
                value={
                  ideas.length > 0
                    ? String(new Set(ideas.map((i) => i.category)).size)
                    : "—"
                }
                label="Categories"
                growth="unique categories"
                color="#33e6b0"
                bg="rgba(51,230,176,.15)"
              />
            </div>

            {/* ========== CATEGORIES ========== */}
            {ideas.length > 0 && (
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className="flex items-center gap-2 h-[44px] px-[14px] rounded-[9px] text-[12.5px] font-semibold whitespace-nowrap transition-all shrink-0"
                      style={{
                        background: isActive ? C.goldGradient : C.card,
                        color: isActive ? C.mainBg : C.heading,
                        border: `1px solid ${
                          isActive ? C.goldHover : C.border
                        }`,
                      }}
                    >
                      <Icon
                        size={17}
                        style={{ color: isActive ? C.mainBg : C.gold }}
                      />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ========== FILTERS ========== */}
            {ideas.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <FilterSelect
                  icon={TrendingUp}
                  label="Sort By"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    "Most Popular",
                    "Most Searches",
                    "Highest Growth",
                  ]}
                />
                <FilterSelect
                  icon={Star}
                  label="Difficulty"
                  value={difficulty}
                  onChange={setDifficulty}
                  options={["All Levels", "Easy", "Medium", "Hard"]}
                />
              </div>
            )}

            {/* ========== ERROR ========== */}
            {error && !loading && (
              <div
                className="rounded-[12px] p-5 mb-4 text-center"
                style={{
                  background: "rgba(255,143,168,.08)",
                  border: `1px solid ${C.rose}55`,
                }}
              >
                <p style={{ color: C.rose, fontSize: 14 }}>{error}</p>
              </div>
            )}

            {/* ========== LOADING ANIMATION ========== */}
            {loading && (
              <div
                className="rounded-[12px] overflow-hidden"
                style={{
                  background: C.card,
                  border: `1px solid ${C.gold}55`,
                }}
              >
                <LoadingAnimation query={appliedQuery} />
              </div>
            )}

            {/* ========== EMPTY STATE ========== */}
            {!loading && !hasSearched && (
              <div
                className="rounded-[12px] p-10 text-center"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="grid place-items-center mx-auto mb-4"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(246,197,93,.1)",
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  <Flame size={32} style={{ color: C.gold }} />
                </div>
                <h3
                  className="font-['Playfair_Display',Georgia,serif] mb-2"
                  style={{ fontSize: 22, color: C.heading }}
                >
                  Search to discover trending ideas
                </h3>
                <p
                  className="mx-auto max-w-md"
                  style={{ fontSize: 14, color: C.secondary }}
                >
                  Type any theme, setting, or genre above — e.g.{" "}
                  <span style={{ color: C.gold }}>"haunted house"</span>,{" "}
                  <span style={{ color: C.gold }}>"1920s speakeasy"</span>,{" "}
                  <span style={{ color: C.gold }}>"space station"</span> — and
                  AI generates 10 fresh mystery ideas.
                </p>
              </div>
            )}

            {/* ========== TABLE ========== */}
            {!loading && filtered.length > 0 && (
              <div
                className="rounded-[12px] overflow-hidden"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="overflow-x-auto">
                  <table
                    className="w-full min-w-[1100px]"
                    style={{ fontSize: 13 }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: C.cardSecondary,
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        <th
                          className="text-center px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 48 }}
                        >
                          #
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary }}
                        >
                          Mystery Idea
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 150 }}
                        >
                          Category
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 160 }}
                        >
                          Popularity
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 100 }}
                        >
                          Searches
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 100 }}
                        >
                          Growth
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 110 }}
                        >
                          Difficulty
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.secondary, width: 190 }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((idea, idx) => {
                        const catColors =
                          CATEGORY_COLORS[idea.category] || {
                            border: C.gold,
                            bg: "rgba(246,197,93,.1)",
                          };
                        const diffColors =
                          DIFFICULTY_COLORS[idea.difficulty] ||
                          DIFFICULTY_COLORS.Medium;
                        return (
                          <tr
                            key={idea.id}
                            style={{
                              borderTop: `1px solid ${C.border}`,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(246,197,93,.03)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "transparent")
                            }
                          >
                            <td
                              className="text-center px-3 py-3"
                              style={{ color: C.secondary }}
                            >
                              {idx + 1}
                            </td>
                            <td className="px-3 py-3">
                              <div
                                className="font-bold"
                                style={{
                                  fontSize: 13.5,
                                  color: C.heading,
                                }}
                              >
                                {idea.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: C.secondary,
                                  marginTop: 3,
                                }}
                              >
                                {idea.description}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className="inline-block px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                                style={{
                                  color: "#fff",
                                  border: `1px solid ${catColors.border}`,
                                  background: catColors.bg,
                                }}
                              >
                                {idea.category}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="rounded-[4px] overflow-hidden"
                                  style={{
                                    width: 73,
                                    height: 10,
                                    background: "rgba(41,65,76,.6)",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${idea.popularity}%`,
                                      background:
                                        "linear-gradient(90deg, #ffc52a, #ffdd4a)",
                                      borderRadius: 4,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: 12.5,
                                    color: C.heading,
                                    fontWeight: 600,
                                  }}
                                >
                                  {idea.popularity}%
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color: C.heading,
                                fontSize: 12.5,
                              }}
                            >
                              {idea.searches}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                style={{
                                  color: C.green,
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                ↑ {idea.growth}%
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className="inline-block px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                                style={{
                                  color: diffColors.text,
                                  border: `1px solid ${diffColors.border}`,
                                  background: diffColors.bg,
                                }}
                              >
                                {idea.difficulty}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleUseIdea(idea)}
                                  className="flex items-center gap-1.5 h-[38px] px-[14px] rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-all hover:-translate-y-[1px]"
                                  style={{
                                    background: C.goldGradient,
                                    color: C.mainBg,
                                    border: `1px solid ${C.goldHover}`,
                                    boxShadow:
                                      "inset 0 1px 1px rgba(255,255,255,.25), 0 4px 12px rgba(246,197,93,.3)",
                                  }}
                                >
                                  Use This Idea
                                  <ArrowRight size={13} />
                                </button>
                                <button
                                  className="grid place-items-center w-[32px] h-[32px] rounded-[8px] transition-colors"
                                  style={{
                                    color: C.secondary,
                                    border: `1px solid ${C.border}`,
                                    background: C.input,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = C.gold;
                                    e.currentTarget.style.borderColor =
                                      C.gold;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                      C.secondary;
                                    e.currentTarget.style.borderColor =
                                      C.border;
                                  }}
                                  aria-label={`More options for ${idea.title}`}
                                >
                                  <MoreVertical size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== NO MATCHES ========== */}
            {!loading &&
              hasSearched &&
              ideas.length > 0 &&
              filtered.length === 0 && (
                <div
                  className="rounded-[12px] p-10 text-center"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p style={{ fontSize: 14, color: C.secondary }}>
                    No ideas match your filters. Try changing the category or
                    difficulty.
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// STAT CARD
// ================================================================
function StatCard({ icon: Icon, value, label, growth, color, bg }) {
  return (
    <div
      className="rounded-[12px] p-4 flex items-center gap-3.5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="grid place-items-center shrink-0 rounded-[12px]"
        style={{
          width: 58,
          height: 58,
          background: bg,
          border: `1px solid ${color}40`,
        }}
      >
        <Icon size={26} style={{ color }} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div
          className="font-bold leading-none"
          style={{ fontSize: 24, color: C.heading }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: C.secondary,
            marginTop: 5,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: C.green,
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          {growth}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// FILTER SELECT
// ================================================================
function FilterSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <div className="relative flex items-center gap-2">
      <Icon size={16} style={{ color: C.gold, flexShrink: 0 }} />
      <span
        className="text-[12px] font-medium whitespace-nowrap"
        style={{ color: C.secondary }}
      >
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none outline-none cursor-pointer"
          style={{
            height: 42,
            border: `1px solid ${C.border}`,
            background: C.input,
            borderRadius: 9,
            color: C.heading,
            padding: "0 34px 0 12px",
            fontSize: 12.5,
            minWidth: 148,
          }}
        >
          {options.map((o) => (
            <option key={o} value={o} style={{ background: C.card }}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: C.gold }}
        />
      </div>
    </div>
  );
}

// ================================================================
// LOADING ANIMATION — full premium experience
// ================================================================
function LoadingAnimation({ query }) {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const STAGES = [
    { label: "Analyzing your search…", icon: "🔍" },
    { label: "Discovering trending themes…", icon: "🔥" },
    { label: "Brainstorming story concepts…", icon: "💡" },
    { label: "Crafting mystery titles…", icon: "✍️" },
    { label: "Building character hooks…", icon: "🎭" },
    { label: "Polishing descriptions…", icon: "✨" },
    { label: "Finalizing your ideas…", icon: "🎯" },
  ];

  // Auto-advance stages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, [STAGES.length]);

  // Live elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[stage];
  const progress = Math.min(
    95,
    ((stage + 1) / STAGES.length) * 100 + Math.min(elapsed, 20)
  );

  return (
    <div className="relative px-8 py-12 overflow-hidden">
      {/* Animated background orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300,
          height: 300,
          top: -150,
          right: -100,
          background:
            "radial-gradient(circle, rgba(246,197,93,.12), transparent 70%)",
          animation: "floatOrb 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220,
          height: 220,
          bottom: -110,
          left: -80,
          background:
            "radial-gradient(circle, rgba(0,212,217,.08), transparent 70%)",
          animation: "floatOrb 10s ease-in-out infinite reverse",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* --- Central animated orb --- */}
        <div
          className="relative mb-8"
          style={{ width: 140, height: 140 }}
        >
          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px dashed ${C.gold}66`,
              animation: "spinSlow 12s linear infinite",
            }}
          />
          {/* Middle rotating ring (reverse) */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 12,
              border: `2px solid ${C.gold}33`,
              borderTopColor: C.gold,
              animation: "spinSlow 3s linear infinite reverse",
            }}
          />
          {/* Inner gold core with pulse */}
          <div
            className="absolute grid place-items-center rounded-full"
            style={{
              inset: 28,
              background: C.goldGradient,
              boxShadow:
                "0 0 40px rgba(246,197,93,.5), inset 0 2px 4px rgba(255,255,255,.3)",
              animation: "pulseCore 2s ease-in-out infinite",
            }}
          >
            <Sparkles
              size={38}
              style={{
                color: C.mainBg,
                animation: "spinSlow 6s linear infinite",
              }}
            />
          </div>

          {/* Ping ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${C.gold}`,
              animation:
                "pingRing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        </div>

        {/* --- Stage label --- */}
        <div
          className="mb-2"
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "'Playfair Display', Georgia, serif",
            color: C.heading,
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "stageFade 0.4s ease-out",
          }}
          key={stage}
        >
          <span style={{ fontSize: 26 }}>{currentStage.icon}</span>
          {currentStage.label}
        </div>

        {query && (
          <div
            className="mb-4"
            style={{
              fontSize: 13,
              color: C.gold,
              fontStyle: "italic",
            }}
          >
            for "{query}"
          </div>
        )}

        {/* --- Progress bar --- */}
        <div
          className="mb-6 rounded-full overflow-hidden"
          style={{
            width: "100%",
            maxWidth: 420,
            height: 6,
            background: "rgba(41,65,76,.6)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #FFD36D, #F6C55D, #B77B32)",
              borderRadius: 999,
              transition: "width 1s ease-out",
              boxShadow: "0 0 12px rgba(246,197,93,.6)",
            }}
          />
        </div>

        {/* --- Stage dots --- */}
        <div className="flex items-center gap-2 mb-6">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i <= stage ? 28 : 8,
                height: 8,
                background: i <= stage ? C.gold : C.border,
                boxShadow:
                  i === stage
                    ? "0 0 12px rgba(246,197,93,.8)"
                    : "none",
              }}
            />
          ))}
        </div>

        {/* --- Helper text + timer --- */}
        <div
          className="flex items-center gap-3 flex-wrap justify-center"
          style={{ fontSize: 12, color: C.secondary }}
        >
          <div className="flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" />
            <span>
              MysteryMint AI is working — usually takes 20-40 seconds
            </span>
          </div>
          <div
            className="px-2 py-1 rounded-full"
            style={{
              background: "rgba(246,197,93,.12)",
              border: `1px solid ${C.gold}45`,
              color: C.gold,
              fontSize: 11,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {elapsed}s
          </div>
        </div>

        {/* --- Skeleton placeholder cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-8 max-w-4xl">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[10px] p-3 overflow-hidden"
              style={{
                background: C.input,
                border: `1px solid ${C.border}`,
                animation: `skeletonPulse 1.8s ease-in-out ${
                  i * 0.3
                }s infinite`,
              }}
            >
              <div
                className="rounded-[6px] mb-2"
                style={{
                  height: 12,
                  width: "70%",
                  background: "rgba(246,197,93,.15)",
                }}
              />
              <div
                className="rounded-[4px] mb-1.5"
                style={{
                  height: 8,
                  width: "100%",
                  background: "rgba(170,179,185,.15)",
                }}
              />
              <div
                className="rounded-[4px]"
                style={{
                  height: 8,
                  width: "60%",
                  background: "rgba(170,179,185,.15)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes pulseCore {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }

        @keyframes pingRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(20px, -20px); }
        }

        @keyframes stageFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
