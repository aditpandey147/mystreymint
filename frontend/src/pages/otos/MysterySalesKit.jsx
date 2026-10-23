// frontend/src/pages/MysterySalesKit.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  BookOpen,
  Check,
  Copy,
  Download,
  ShoppingBag,
  Package,
  Award,
  Briefcase,
  MapPin, // ← replaces Pin
  Music2, // ✅ already valid
  Camera, // ← replaces Instagram
  Users, // ← replaces Facebook
  Network, // ← replaces Linkedin
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Type,
  AlignLeft,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import salesKitBg from "../../assets/images/sales-kit-bg.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

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
// PLATFORMS
// ================================================================
const PLATFORMS = [
  {
    id: "etsy",
    label: "Etsy",
    icon: ShoppingBag, // ✅ valid
    color: "#F56400",
    tagline: "Printables & digital downloads",
  },
  {
    id: "gumroad",
    label: "Gumroad",
    icon: Package, // ✅ valid
    color: "#FF90E8",
    tagline: "Digital products",
  },
  {
    id: "amazon_kdp",
    label: "Amazon KDP",
    icon: BookOpen, // ✅ valid
    color: "#FF9900",
    tagline: "Kindle & paperback",
  },
  {
    id: "fiverr",
    label: "Fiverr",
    icon: Briefcase, // ✅ valid
    color: "#1DBF73",
    tagline: "Custom service gig",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: MapPin, // ← was Pin (invalid), now MapPin
    color: "#E60023",
    tagline: "Visual discovery",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Music2, // ✅ valid (music note = TikTok-ish)
    color: "#00F2EA",
    tagline: "Short-form video",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Camera, // ← was Instagram (invalid), now Camera
    color: "#E1306C",
    tagline: "Posts & stories",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Users, // ← was Facebook (invalid), now Users
    color: "#1877F2",
    tagline: "Community posts",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Network, // ← was Linkedin (invalid), now Network
    color: "#0A66C2",
    tagline: "Professional angle",
  },
  {
    id: "blog",
    label: "Blog",
    icon: FileText, // ✅ valid
    color: "#A78BFA",
    tagline: "SEO article",
  },
];

// ================================================================
// COPY HELPER
// ================================================================
async function copyToClipboard(text, label = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Copy failed");
  }
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function MysterySalesKit() {
  const [mysteries, setMysteries] = useState([]);
  const [loadingMysteries, setLoadingMysteries] = useState(true);

  const [selectedMystery, setSelectedMystery] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [kitData, setKitData] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // ================================================================
  // FETCH MYSTERIES
  // ================================================================
  useEffect(() => {
    const fetchMysteries = async () => {
      try {
        setLoadingMysteries(true);
        const res = await api.get("/mysteries");
        if (res.data?.success) {
          const ready = (res.data.data || []).filter(
            (m) =>
              m.generationStatus === "completed" ||
              m.generationStatus === "needs_review",
          );
          setMysteries(ready);
        }
      } catch (err) {
        console.error("Failed to load mysteries:", err);
        toast.error("Failed to load mysteries");
      } finally {
        setLoadingMysteries(false);
      }
    };
    fetchMysteries();
  }, []);

  // ================================================================
  // SELECT PLATFORM
  // ================================================================
  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(PLATFORMS.map((p) => p.id));
  };

  const clearPlatforms = () => {
    setSelectedPlatforms([]);
  };

  // ================================================================
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (!selectedMystery) {
      toast.error("Select a mystery first");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }
    if (generating) return;

    try {
      setGenerating(true);
      setKitData(null);
      toast.loading("Generating sales kit…", { id: "gen-kit" });

      const res = await api.post(
        "/sales-kit/generate",
        {
          mysteryId: selectedMystery._id,
          platforms: selectedPlatforms,
        },
        { timeout: 300000 },
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Generation failed");
      }

      toast.success("Sales kit ready!", { id: "gen-kit" });
      setKitData(res.data.data);

      // Auto-select first generated platform tab
      const firstPlatform = Object.keys(res.data.data.platforms || {})[0];
      setActiveTab(firstPlatform || "overview");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to generate",
        { id: "gen-kit" },
      );
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // DOWNLOAD ALL AS TXT
  // ================================================================
  const downloadAllAsTxt = () => {
    if (!kitData) return;

    let text = `# SALES KIT — ${kitData.mysteryTitle}\n\n`;
    text += `## Master Tagline\n${kitData.masterTagline}\n\n`;
    text += `## Product Summary\n${kitData.productSummary}\n\n`;
    text += `## Key Selling Points\n${kitData.keySellingPoints
      .map((p) => `- ${p}`)
      .join("\n")}\n\n`;
    text += `## Target Audience\n${kitData.targetAudience}\n\n`;

    Object.entries(kitData.platforms).forEach(([key, data]) => {
      const p = PLATFORMS.find((pl) => pl.id === key);
      text += `\n${"=".repeat(60)}\n## ${p?.label || key}\n${"=".repeat(60)}\n\n`;
      Object.entries(data).forEach(([field, val]) => {
        if (Array.isArray(val)) {
          text += `### ${field}\n${val.map((v) => `- ${v}`).join("\n")}\n\n`;
        } else {
          text += `### ${field}\n${val}\n\n`;
        }
      });
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kitData.mysteryTitle.replace(/\s+/g, "_")}_Sales_Kit.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Downloaded");
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
                minHeight: "300px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${salesKitBg})`,
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
                  Mystery Sales Kit
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
                  Sell Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Mystery
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Pick a mystery, choose your platforms, and let AI write
                  platform-optimized sales copy for every marketplace at once.
                </p>
              </div>
            </section>

            {/* ========== STEP 1 — PICK MYSTERY ========== */}
            <section
              className="rounded-[12px] p-5 mb-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="grid place-items-center shrink-0 rounded-full font-bold"
                  style={{
                    width: 34,
                    height: 34,
                    background: C.goldGradient,
                    color: C.mainBg,
                    fontSize: 15,
                  }}
                >
                  1
                </div>
                <div>
                  <h2
                    className="font-bold"
                    style={{ fontSize: 16, color: C.heading }}
                  >
                    Select a Mystery
                  </h2>
                  <p style={{ fontSize: 12.5, color: C.secondary }}>
                    Only completed mysteries can be marketed
                  </p>
                </div>
              </div>

              {loadingMysteries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-[10px]"
                      style={{
                        background: C.input,
                        border: `1px solid ${C.border}`,
                        height: 100,
                      }}
                    />
                  ))}
                </div>
              ) : mysteries.length === 0 ? (
                <div
                  className="rounded-[10px] p-6 text-center"
                  style={{
                    background: C.input,
                    border: `1px dashed ${C.border}`,
                  }}
                >
                  <BookOpen
                    size={32}
                    style={{
                      color: C.gold,
                      margin: "0 auto 12px",
                      opacity: 0.6,
                    }}
                  />
                  <p style={{ fontSize: 13, color: C.secondary }}>
                    No completed mysteries yet. Generate one first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mysteries.map((m) => {
                    const cover = m.images?.cover
                      ? getImageUrl(m.images.cover)
                      : null;
                    const isSelected = selectedMystery?._id === m._id;
                    return (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => setSelectedMystery(m)}
                        className="rounded-[10px] p-3 text-left transition-all hover:-translate-y-[1px]"
                        style={{
                          background: isSelected
                            ? "rgba(246,197,93,.1)"
                            : C.input,
                          border: isSelected
                            ? `2px solid ${C.gold}`
                            : `1px solid ${C.border}`,
                          boxShadow: isSelected
                            ? `0 0 0 3px rgba(246,197,93,.15)`
                            : "none",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {cover ? (
                            <img
                              src={cover}
                              alt={m.title}
                              className="rounded-[6px] shrink-0 object-cover"
                              style={{
                                width: 56,
                                height: 56,
                                border: `1px solid ${C.border}`,
                              }}
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <div
                              className="rounded-[6px] shrink-0 grid place-items-center"
                              style={{
                                width: 56,
                                height: 56,
                                background: "rgba(246,197,93,.1)",
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <BookOpen size={22} style={{ color: C.gold }} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-bold truncate mb-1"
                              style={{ fontSize: 13.5, color: C.heading }}
                              title={m.title}
                            >
                              {m.title}
                            </div>
                            <div
                              className="truncate"
                              style={{ fontSize: 11, color: C.secondary }}
                            >
                              {m.genre} · {m.setting}
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              className="grid place-items-center shrink-0 rounded-full"
                              style={{
                                width: 22,
                                height: 22,
                                background: C.gold,
                                color: C.mainBg,
                              }}
                            >
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ========== STEP 2 — PICK PLATFORMS ========== */}
            <section
              className="rounded-[12px] p-5 mb-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="grid place-items-center shrink-0 rounded-full font-bold"
                    style={{
                      width: 34,
                      height: 34,
                      background: C.goldGradient,
                      color: C.mainBg,
                      fontSize: 15,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      Choose Publishing Platforms
                    </h2>
                    <p style={{ fontSize: 12.5, color: C.secondary }}>
                      {selectedPlatforms.length} of {PLATFORMS.length} selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllPlatforms}
                    className="h-[34px] px-3 rounded-[8px] text-[12px] font-semibold transition-all"
                    style={{
                      background: "transparent",
                      color: C.gold,
                      border: `1px solid ${C.gold}`,
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearPlatforms}
                    className="h-[34px] px-3 rounded-[8px] text-[12px] font-semibold transition-all"
                    style={{
                      background: "transparent",
                      color: C.secondary,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className="relative rounded-[10px] p-3 text-left transition-all hover:-translate-y-[1px]"
                      style={{
                        background: isSelected ? `${p.color}15` : C.input,
                        border: isSelected
                          ? `2px solid ${p.color}`
                          : `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        className="grid place-items-center rounded-[8px] mb-2"
                        style={{
                          width: 32,
                          height: 32,
                          background: `${p.color}20`,
                          border: `1px solid ${p.color}55`,
                        }}
                      >
                        <Icon size={16} style={{ color: p.color }} />
                      </div>
                      <div
                        className="font-bold mb-0.5 truncate"
                        style={{ fontSize: 12.5, color: C.heading }}
                      >
                        {p.label}
                      </div>
                      <div
                        className="truncate"
                        style={{ fontSize: 10, color: C.secondary }}
                      >
                        {p.tagline}
                      </div>

                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 grid place-items-center rounded-full"
                          style={{
                            width: 18,
                            height: 18,
                            background: p.color,
                            color: "#fff",
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ========== STEP 3 — GENERATE ========== */}
            <section
              className="rounded-[12px] p-5 mb-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="grid place-items-center shrink-0 rounded-full font-bold"
                    style={{
                      width: 34,
                      height: 34,
                      background: C.goldGradient,
                      color: C.mainBg,
                      fontSize: 15,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      Generate Sales Kit
                    </h2>
                    <p style={{ fontSize: 12.5, color: C.secondary }}>
                      AI writes platform-optimized copy — takes 30-60 seconds
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    !selectedMystery ||
                    selectedPlatforms.length === 0
                  }
                  className="flex items-center justify-center gap-2 h-[50px] px-[22px] rounded-[11px] text-[14px] font-bold transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{
                    background: C.goldGradient,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Generate Sales Kit
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* ========== RESULTS ========== */}
            {kitData && (
              <KitResults
                data={kitData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDownloadAll={downloadAllAsTxt}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// RESULTS COMPONENT
// ================================================================
function KitResults({ data, activeTab, setActiveTab, onDownloadAll }) {
  const platformKeys = Object.keys(data.platforms || {});

  return (
    <div className="space-y-4">
      {/* Header + download */}
      <section
        className="rounded-[12px] p-5"
        style={{
          background: C.card,
          border: `1px solid ${C.gold}55`,
          boxShadow: `0 0 30px rgba(246,197,93,.1)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="grid place-items-center rounded-[10px]"
              style={{
                width: 44,
                height: 44,
                background: "rgba(246,197,93,.15)",
                border: `1px solid ${C.gold}55`,
              }}
            >
              <Award size={22} style={{ color: C.gold }} />
            </div>
            <div>
              <div
                className="font-bold mb-1"
                style={{ fontSize: 17, color: C.heading }}
              >
                {data.mysteryTitle}
              </div>
              <div style={{ fontSize: 12, color: C.secondary }}>
                Sales kit for {platformKeys.length} platform
                {platformKeys.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDownloadAll}
            className="flex items-center gap-2 h-[40px] px-4 rounded-[9px] text-[12.5px] font-bold transition-all hover:-translate-y-[1px]"
            style={{
              background: "transparent",
              color: C.gold,
              border: `1px solid ${C.gold}`,
            }}
          >
            <Download size={14} />
            Download All (.txt)
          </button>
        </div>

        {/* Master tagline */}
        {data.masterTagline && (
          <div
            className="mt-4 p-4 rounded-[10px] italic text-center font-['Playfair_Display',Georgia,serif]"
            style={{
              background: "rgba(246,197,93,.08)",
              border: `1px solid ${C.gold}45`,
              fontSize: 17,
              color: C.goldHover,
              lineHeight: 1.4,
            }}
          >
            "{data.masterTagline}"
          </div>
        )}

        {/* Product summary + selling points + audience */}
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {data.productSummary && (
            <div
              className="p-3 rounded-[10px]"
              style={{
                background: C.input,
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                className="font-bold mb-1.5 flex items-center gap-1.5"
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1.3px",
                  color: C.gold,
                }}
              >
                <AlignLeft size={11} /> Product Summary
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: C.heading,
                  lineHeight: 1.6,
                }}
              >
                {data.productSummary}
              </p>
            </div>
          )}

          {data.targetAudience && (
            <div
              className="p-3 rounded-[10px]"
              style={{
                background: C.input,
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                className="font-bold mb-1.5 flex items-center gap-1.5"
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1.3px",
                  color: C.gold,
                }}
              >
                <Tag size={11} /> Target Audience
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: C.heading,
                  lineHeight: 1.6,
                }}
              >
                {data.targetAudience}
              </p>
            </div>
          )}
        </div>

        {data.keySellingPoints?.length > 0 && (
          <div
            className="mt-3 p-3 rounded-[10px]"
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="font-bold mb-2 flex items-center gap-1.5"
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                color: C.gold,
              }}
            >
              <ListChecks size={11} /> Key Selling Points
            </div>
            <ul className="space-y-1.5">
              {data.keySellingPoints.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2"
                  style={{ fontSize: 12.5, color: C.heading }}
                >
                  <CheckCircle2
                    size={13}
                    style={{ color: C.gold, marginTop: 3, flexShrink: 0 }}
                  />
                  <span style={{ lineHeight: 1.5 }}>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Platform tabs */}
      <section
        className="rounded-[12px] p-2 overflow-x-auto"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 min-w-max">
          {platformKeys.map((key) => {
            const platform = PLATFORMS.find((p) => p.id === key);
            const Icon = platform?.icon || Package;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-2 h-[42px] px-[14px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all shrink-0"
                style={{
                  background: isActive ? C.gold : "transparent",
                  color: isActive ? C.mainBg : C.secondary,
                  border: isActive
                    ? `1px solid ${C.goldHover}`
                    : `1px solid ${C.border}`,
                }}
              >
                <Icon
                  size={15}
                  style={{
                    color: isActive ? C.mainBg : platform?.color || C.gold,
                  }}
                />
                {platform?.label || key}
              </button>
            );
          })}
        </div>
      </section>

      {/* Platform content */}
      {activeTab && data.platforms[activeTab] && (
        <PlatformContent
          platform={PLATFORMS.find((p) => p.id === activeTab)}
          data={data.platforms[activeTab]}
        />
      )}
    </div>
  );
}

// ================================================================
// PLATFORM CONTENT RENDERER
// ================================================================
function PlatformContent({ platform, data }) {
  if (!platform) return null;
  const Icon = platform.icon;

  return (
    <section
      className="rounded-[12px] overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${platform.color}15 0%, transparent 100%)`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          className="grid place-items-center shrink-0 rounded-[10px]"
          style={{
            width: 40,
            height: 40,
            background: `${platform.color}20`,
            border: `1px solid ${platform.color}55`,
          }}
        >
          <Icon size={20} style={{ color: platform.color }} />
        </div>
        <div>
          <div className="font-bold" style={{ fontSize: 16, color: C.heading }}>
            {platform.label}
          </div>
          <div style={{ fontSize: 11.5, color: C.secondary }}>
            {platform.tagline}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4">
        {Object.entries(data).map(([field, value]) => (
          <FieldBlock key={field} label={field} value={value} />
        ))}
      </div>
    </section>
  );
}

// ================================================================
// FIELD BLOCK — renders scalar or array fields
// ================================================================
function FieldBlock({ label, value }) {
  const [copied, setCopied] = useState(false);

  const displayLabel = label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());

  const copyValue = async () => {
    const text = Array.isArray(value) ? value.join("\n") : String(value);
    await copyToClipboard(text, "Copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isEmpty =
    !value ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "string" && !value.trim());

  if (isEmpty) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div
          className="font-bold flex items-center gap-1.5"
          style={{
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: "1.3px",
            color: C.gold,
          }}
        >
          {displayLabel}
        </div>
        <button
          type="button"
          onClick={copyValue}
          className="flex items-center gap-1 h-[26px] px-2 rounded-[6px] text-[11px] font-semibold transition-all"
          style={{
            background: copied ? "rgba(0,212,217,.15)" : "transparent",
            color: copied ? C.cyan : C.secondary,
            border: `1px solid ${copied ? C.cyan : C.border}`,
          }}
        >
          {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-[6px] text-[12px]"
              style={{
                background: C.input,
                border: `1px solid ${C.border}`,
                color: C.heading,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <div
          className="rounded-[8px] p-3 whitespace-pre-line"
          style={{
            background: C.input,
            border: `1px solid ${C.border}`,
            fontSize: 12.5,
            lineHeight: 1.65,
            color: C.heading,
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}
