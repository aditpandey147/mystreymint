// frontend/src/pages/MysteryDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  BookOpen,
  Users,
  Search,
  Puzzle,
  Clock,
  AlertCircle,
  Lightbulb,
  ScrollText,
  MapPin,
  Gift,
  Image as ImageIcon,
  LayoutGrid,
  Eye,
  FileText,
  Star,
  X,
  Lock,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// 🎨 LUXURY DETECTIVE THEME
// ================================================================
const C = {
  mainBg: "#080D13",
  sidebar: "#0D1721",
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
  danger: "#ff8fa8",
};

// ================================================================
// 🗂️ PDF KINDS
// ================================================================
const PDF_KINDS = {
  story: {
    label: "Mystery Story",
    fileName: "Mystery_Story.pdf",
    icon: BookOpen,
  },
  suspects: {
    label: "Suspect Cards",
    fileName: "Suspect_Cards.pdf",
    icon: Users,
  },
  clues: {
    label: "Clues & Evidence",
    fileName: "Clues_and_Evidence.pdf",
    icon: Search,
  },
  puzzles: {
    label: "Puzzle Sheets",
    fileName: "Puzzle_Sheets.pdf",
    icon: Puzzle,
  },
  solution: {
    label: "Solution Guide",
    fileName: "Solution_Guide.pdf",
    icon: AlertCircle,
  },
  instructions: {
    label: "Player Instructions",
    fileName: "Player_Instructions.pdf",
    icon: ScrollText,
  },
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// 📥 PDF FETCH HELPERS
// ================================================================
async function openPdfInNewTab(mysteryId, kind) {
  const toastId = `pdf-view-${kind}`;
  toast.loading("Building PDF…", { id: toastId });

  try {
    const res = await api.get(`/mysteries/${mysteryId}/pdf/${kind}`, {
      responseType: "blob",
      timeout: 180000,
      headers: { Accept: "application/pdf" },
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const win = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${kind}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Popup blocked — downloaded instead", { id: toastId });
    } else {
      toast.success("PDF opened in new tab", { id: toastId });
    }

    setTimeout(() => window.URL.revokeObjectURL(url), 120000);
  } catch (err) {
    console.error("PDF view failed:", err);
    toast.error(
      err.response?.data?.message || err.message || "Failed to build PDF",
      { id: toastId }
    );
  }
}

async function downloadPdfFile(mysteryId, kind, fileName = `${kind}.pdf`) {
  const toastId = `pdf-dl-${kind}`;
  toast.loading("Building PDF…", { id: toastId });

  try {
    const res = await api.get(
      `/mysteries/${mysteryId}/pdf/${kind}/download`,
      {
        responseType: "blob",
        timeout: 180000,
        headers: { Accept: "application/pdf" },
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("PDF downloaded", { id: toastId });
  } catch (err) {
    console.error("PDF download failed:", err);
    toast.error(
      err.response?.data?.message || err.message || "Failed to download PDF",
      { id: toastId }
    );
  }
}

// ================================================================
// 🧩 SHARED COMPONENTS
// ================================================================
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="grid place-items-center shrink-0"
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "rgba(245,185,66,.12)",
          border: `1px solid ${C.gold}55`,
        }}
      >
        <Icon size={20} style={{ color: C.gold }} />
      </div>
      <div>
        <h2
          className="font-['Playfair_Display',Georgia,serif] font-bold"
          style={{ fontSize: 22, color: C.heading, lineHeight: 1.2 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: C.secondary, marginTop: 3 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ children, style = {} }) {
  return (
    <section
      className="rounded-[12px]"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SceneImage({ url, caption, aspect = "16/9" }) {
  if (!url) return null;
  return (
    <div
      className="rounded-[10px] overflow-hidden my-4"
      style={{ border: `1px solid ${C.gold}55`, background: "#000000" }}
    >
      <div className="relative w-full" style={{ aspectRatio: aspect }}>
        <img
          src={url}
          alt={caption || "Scene"}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
      {caption && (
        <div
          className="px-4 py-2.5 text-center italic"
          style={{
            fontSize: 12,
            color: C.secondary,
            borderTop: `1px solid ${C.border}`,
            background: C.input,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 h-[42px] px-[16px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all shrink-0"
      style={{
        background: active ? C.gold : "transparent",
        color: active ? C.mainBg : C.secondary,
        border: active ? `1px solid ${C.goldHover}` : `1px solid ${C.border}`,
        boxShadow: active
          ? "inset 0 1px 1px rgba(255,255,255,.25), 0 4px 14px rgba(245,185,66,.3)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = C.input;
          e.currentTarget.style.color = C.heading;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = C.secondary;
        }
      }}
    >
      <Icon size={15} />
      {label}
      {count !== undefined && (
        <span
          className="px-1.5 rounded-full"
          style={{
            fontSize: 10,
            fontWeight: 700,
            background: active ? "rgba(0,0,0,.2)" : "rgba(245,185,66,.15)",
            color: active ? C.mainBg : C.gold,
            minWidth: 20,
            textAlign: "center",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ================================================================
// 📄 PDF ACTIONS
// ================================================================
function PdfActions({ mysteryId, kind, fileName, compact = false }) {
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const onView = async () => {
    if (viewing) return;
    setViewing(true);
    try {
      await openPdfInNewTab(mysteryId, kind);
    } finally {
      setViewing(false);
    }
  };

  const onDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadPdfFile(mysteryId, kind, fileName);
    } finally {
      setDownloading(false);
    }
  };

  const h = compact ? 36 : 42;
  const px = compact ? 12 : 16;
  const fs = compact ? 12 : 13;
  const icon = compact ? 13 : 15;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onView}
        disabled={viewing}
        className="flex items-center gap-1.5 rounded-[9px] font-bold transition-all hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          height: h,
          paddingLeft: px,
          paddingRight: px,
          fontSize: fs,
          background: "transparent",
          color: C.gold,
          border: `1px solid ${C.gold}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(245,185,66,.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {viewing ? (
          <Loader2 size={icon} className="animate-spin" />
        ) : (
          <Eye size={icon} />
        )}
        View PDF
      </button>

      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 rounded-[9px] font-bold transition-all hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          height: h,
          paddingLeft: px,
          paddingRight: px,
          fontSize: fs,
          background: C.gold,
          color: C.mainBg,
          border: `1px solid ${C.goldHover}`,
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,.25), 0 4px 14px rgba(245,185,66,.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.goldHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
      >
        {downloading ? (
          <Loader2 size={icon} className="animate-spin" />
        ) : (
          <Download size={icon} />
        )}
        Download
      </button>
    </div>
  );
}

// ================================================================
// 📄 PDF BAR
// ================================================================
function PdfBar({ mysteryId, kind, fileName, description }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <p style={{ fontSize: 13, color: C.secondary, flex: "1 1 260px" }}>
        {description}
      </p>
      <PdfActions mysteryId={mysteryId} kind={kind} fileName={fileName} />
    </div>
  );
}

// ================================================================
// 🧠 PUZZLE HINTS (collapsed by default)
// ================================================================
function PuzzleHints({ hints, puzzleId }) {
  const [open, setOpen] = useState(false);
  if (!hints?.length) return null;

  return (
    <div
      className="rounded-[8px]"
      style={{ background: C.input, border: `1px solid ${C.cyan}33` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: C.cyan,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
        }}
      >
        <span className="flex items-center gap-2">
          <Lightbulb size={12} />
          {open ? "Hide hints" : `Show hints (${hints.length})`}
        </span>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="list-disc pl-8 pr-3 pb-3 space-y-1">
          {hints.map((h, i) => (
            <li
              key={`${puzzleId}-${i}`}
              style={{
                fontSize: 13,
                color: C.secondary,
                lineHeight: 1.55,
              }}
            >
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ================================================================
// 🔒 SEALED EVIDENCE GATE
// ================================================================
function SealedEvidence({ evidence: e }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  const submit = (ev) => {
    ev.preventDefault();
    if (String(code).trim() === String(e.unlockCode ?? "")) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect code. Check your puzzle answers.");
    }
  };

  if (unlocked) {
    return (
      <div
        className="rounded-[10px] p-5"
        style={{
          border: `1px solid ${C.gold}`,
          background: C.input,
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: C.gold,
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          {e.type} · Unlocked
        </div>
        <h3
          className="font-bold mb-3"
          style={{ fontSize: 16, color: C.heading }}
        >
          {e.title}
        </h3>
        <div
          className="whitespace-pre-line leading-[1.75]"
          style={{
            fontSize: 14,
            color: C.heading,
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {e.body}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[10px] p-5"
      style={{
        border: `1.5px dashed ${C.gold}88`,
        background: "rgba(245,185,66,.06)",
        textAlign: "center",
      }}
    >
      <div
        className="grid place-items-center mx-auto mb-3"
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "rgba(245,185,66,.14)",
          border: `1px solid ${C.gold}66`,
        }}
      >
        <Lock size={22} style={{ color: C.gold }} />
      </div>
      <h3
        className="font-['Playfair_Display',Georgia,serif] font-semibold mb-1"
        style={{ fontSize: 18, color: C.heading }}
      >
        {e.title}
      </h3>
      <p className="mb-4" style={{ fontSize: 13, color: C.secondary }}>
        This packet is sealed. Solve the linked puzzles and enter the
        three-digit code to open it.
      </p>
      <form
        onSubmit={submit}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <input
          value={code}
          onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter code"
          inputMode="numeric"
          className="rounded-[9px] px-3 h-[40px] text-center font-bold"
          style={{
            background: C.input,
            color: C.heading,
            border: `1px solid ${C.border}`,
            outline: "none",
            fontSize: 16,
            width: 160,
            letterSpacing: ".4em",
            fontFamily: "'Courier New', Courier, monospace",
          }}
        />
        <button
          type="submit"
          className="h-[40px] px-4 rounded-[9px] font-bold text-[13px]"
          style={{
            background: C.gold,
            color: C.mainBg,
            border: `1px solid ${C.goldHover}`,
            cursor: "pointer",
          }}
        >
          Unlock
        </button>
      </form>
      {error && (
        <p className="mt-2" style={{ fontSize: 12.5, color: C.danger }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ================================================================
// 🎯 MAIN PAGE
// ================================================================
export default function MysteryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mystery, setMystery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // ---------- FETCH ----------
  useEffect(() => {
    const fetchMystery = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/mysteries/${id}`);
        if (res.data?.success) {
          setMystery(res.data.data);
        } else {
          toast.error("Failed to load mystery");
          navigate("/my-mysteries");
        }
      } catch (err) {
        console.error("Failed to load mystery:", err);
        toast.error(err.response?.data?.message || "Mystery not found");
        navigate("/my-mysteries");
      } finally {
        setLoading(false);
      }
    };
    fetchMystery();
  }, [id, navigate]);

  // ---------- DOWNLOAD FULL KIT ----------
  const handleDownload = async () => {
    try {
      setDownloading(true);
      toast.loading("Preparing your kit... This may take 30-60 seconds.", {
        id: "dl-detail",
      });

      const buildRes = await api.post(`/mysteries/${id}/export`);
      if (!buildRes.data?.success) {
        throw new Error(buildRes.data?.message || "Export failed");
      }

      const zipInfo = buildRes.data.zip;
      if (!zipInfo?.downloadUrl) throw new Error("ZIP not available");

      const zipRes = await api.get(zipInfo.downloadUrl, {
        responseType: "blob",
        timeout: 180000,
      });

      const blob = new Blob([zipRes.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", zipInfo.fileName || `${mystery.title}.zip`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Kit downloaded!", { id: "dl-detail" });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to prepare kit",
        { id: "dl-detail" }
      );
    } finally {
      setDownloading(false);
    }
  };

  // ---------- DERIVED ----------
  const derived = useMemo(() => {
    if (!mystery) return null;

    const {
      story,
      characters = [],
      clues = [],
      evidence = [],
      puzzles = [],
      playerTimeline = [],
      images = {},
    } = mystery;

    const coverUrl = images.cover ? getImageUrl(images.cover) : null;

    const sceneImages = (images.scenes || [])
      .filter((s) => s.url)
      .map((s) => ({
        url: getImageUrl(s.url),
        location: s.location || "Scene",
      }));

    const portraitMap = {};
    (images.characters || []).forEach((c) => {
      if (c.characterId && c.url) {
        portraitMap[c.characterId] = getImageUrl(c.url);
      }
    });

    const chapters = Array.isArray(story?.chapters) ? story.chapters : [];

    const hasStory =
      story &&
      (chapters.length > 0 ||
        story.introduction ||
        story.background ||
        story.settingDescription ||
        story.mainIncident ||
        story.crimeDiscovery ||
        story.investigationOpening ||
        (story.suspensefulDevelopments?.length > 0) ||
        story.finalChallenge);

    return {
      story,
      chapters,
      characters,
      clues,
      evidence,
      puzzles,
      playerTimeline,
      coverUrl,
      sceneImages,
      portraitMap,
      hasStory,
    };
  }, [mystery]);

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div
        className="flex min-h-screen"
        style={{ background: C.mainBg, color: C.heading }}
      >
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 grid place-items-center">
            <div className="text-center">
              <Loader2
                size={40}
                className="animate-spin mx-auto mb-4"
                style={{ color: C.gold }}
              />
              <p style={{ color: C.secondary, fontSize: 14 }}>
                Loading your mystery...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!mystery || !derived) return null;

  const {
    title,
    genre,
    setting,
    difficulty,
    playerCount,
    duration,
    targetAudience,
    generationStatus,
  } = mystery;

  const {
    story,
    chapters,
    characters,
    clues,
    evidence,
    puzzles,
    playerTimeline,
    coverUrl,
    sceneImages,
    portraitMap,
    hasStory,
  } = derived;

  const isReady = ["completed", "needs_review"].includes(generationStatus);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    hasStory && {
      id: "story",
      label: "Story",
      icon: BookOpen,
      count: chapters.length || undefined,
    },
    characters.length > 0 && {
      id: "characters",
      label: "Characters",
      icon: Users,
      count: characters.length,
    },
    clues.length > 0 && {
      id: "clues",
      label: "Clues",
      icon: Search,
      count: clues.length,
    },
    evidence.length > 0 && {
      id: "evidence",
      label: "Evidence",
      icon: ScrollText,
      count: evidence.length,
    },
    puzzles.length > 0 && {
      id: "puzzles",
      label: "Puzzles",
      icon: Puzzle,
      count: puzzles.length,
    },
    playerTimeline.length > 0 && {
      id: "timeline",
      label: "Timeline",
      icon: Clock,
      count: playerTimeline.length,
    },
  ].filter(Boolean);

  // ================================================================
  // RENDER TABS
  // ================================================================
  const renderTab = () => {
    // ---------- OVERVIEW ----------
    if (activeTab === "overview") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Genre", value: genre },
              { label: "Setting", value: setting },
              { label: "Difficulty", value: difficulty },
              { label: "Players", value: playerCount },
              { label: "Duration", value: `${duration} min` },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[10px] p-3.5"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    color: C.secondary,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="font-['Playfair_Display',Georgia,serif] font-bold truncate"
                  style={{ fontSize: 15, color: C.heading }}
                  title={String(item.value || "—")}
                >
                  {item.value || "—"}
                </div>
              </div>
            ))}
          </div>

          <Section>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "1.3px",
                color: C.gold,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Target Audience
            </div>
            <p style={{ fontSize: 14.5, color: C.heading }}>
              {targetAudience || "—"}
            </p>
          </Section>

          <Section>
            <SectionHeader
              icon={FileText}
              title="Download Individual PDFs"
              subtitle="Each section as a standalone print-ready PDF"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(PDF_KINDS).map(([kind, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div
                    key={kind}
                    className="rounded-[10px] p-3.5 flex flex-col gap-3"
                    style={{
                      background: C.input,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="grid place-items-center shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "rgba(245,185,66,.12)",
                          border: `1px solid ${C.gold}55`,
                        }}
                      >
                        <Icon size={16} style={{ color: C.gold }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-bold truncate"
                          style={{ fontSize: 14, color: C.heading }}
                        >
                          {cfg.label}
                        </div>
                        <div
                          className="truncate"
                          style={{ fontSize: 11.5, color: C.secondary }}
                          title={cfg.fileName}
                        >
                          {cfg.fileName}
                        </div>
                      </div>
                    </div>
                    <PdfActions
                      mysteryId={mystery._id}
                      kind={kind}
                      fileName={cfg.fileName}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          </Section>

          {sceneImages.length > 0 && (
            <Section>
              <SectionHeader
                icon={ImageIcon}
                title={`Crime Scene Illustrations (${sceneImages.length})`}
                subtitle="Visual reconstruction of the key locations"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sceneImages.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-[10px] overflow-hidden"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: "#000000",
                    }}
                  >
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={s.url}
                        alt={s.location}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div
                      className="px-4 py-3 text-center font-semibold"
                      style={{
                        fontSize: 12.5,
                        color: C.heading,
                        borderTop: `1px solid ${C.border}`,
                        background: C.input,
                      }}
                    >
                      {s.location}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section>
            <div className="flex flex-wrap gap-2.5">
              {tabs
                .filter((t) => t.id !== "overview")
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-2 h-[40px] px-[16px] rounded-[9px] text-[12.5px] font-semibold transition-all"
                    style={{
                      background: C.input,
                      color: C.heading,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.gold;
                      e.currentTarget.style.color = C.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.heading;
                    }}
                  >
                    <t.icon size={14} style={{ color: C.gold }} />
                    Open {t.label}
                  </button>
                ))}
            </div>
          </Section>
        </div>
      );
    }

    // ---------- STORY (chapters-aware) ----------
    if (activeTab === "story") {
      return (
        <Section>
          <SectionHeader
            icon={BookOpen}
            title="The Story"
            subtitle="Read this first — it sets the scene"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="story"
            fileName="Mystery_Story.pdf"
            description="Download or view this section as a standalone PDF (full-bleed cover included)."
          />

          {/* PRIMARY: chapter-based narrative */}
          {chapters.length > 0 ? (
            <div className="space-y-5">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id || idx}
                  className="rounded-[10px] p-5"
                  style={{
                    background: C.input,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: "1.4px",
                      color: C.gold,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Chapter {ch.chapterNumber ?? idx + 1}
                  </div>
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-3"
                    style={{ fontSize: 19, color: C.heading }}
                  >
                    {ch.title || `Chapter ${idx + 1}`}
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {ch.body}
                  </p>

                  {sceneImages[idx] && idx % 6 === 0 && (
                    <SceneImage
                      url={sceneImages[idx].url}
                      caption={sceneImages[idx].location}
                    />
                  )}
                </div>
              ))}

              <div
                className="rounded-[10px] p-5 text-center"
                style={{
                  background: "rgba(245,185,66,.08)",
                  border: `1px solid ${C.gold}55`,
                }}
              >
                <p
                  className="mb-3"
                  style={{ fontSize: 14, color: C.heading }}
                >
                  The narrative ends here. The investigation begins now.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("clues")}
                  className="inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] font-bold text-[13px]"
                  style={{
                    background: C.gold,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                    cursor: "pointer",
                  }}
                >
                  Begin Investigation
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            /* FALLBACK: legacy flat-field story */
            <>
              {story.introduction && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    Introduction
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.introduction}
                  </p>
                  {sceneImages[0] && (
                    <SceneImage
                      url={sceneImages[0].url}
                      caption={sceneImages[0].location}
                    />
                  )}
                </div>
              )}

              {story.background && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    Background
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.background}
                  </p>
                </div>
              )}

              {story.settingDescription && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    The Setting
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.settingDescription}
                  </p>
                  {sceneImages[1] && (
                    <SceneImage
                      url={sceneImages[1].url}
                      caption={sceneImages[1].location}
                    />
                  )}
                </div>
              )}

              {story.mainIncident && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    The Incident
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.mainIncident}
                  </p>
                </div>
              )}

              {story.crimeDiscovery && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    The Discovery
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.crimeDiscovery}
                  </p>
                  {sceneImages[2] && (
                    <SceneImage
                      url={sceneImages[2].url}
                      caption={sceneImages[2].location}
                    />
                  )}
                </div>
              )}

              {story.investigationOpening && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    The Investigation Begins
                  </h3>
                  <p
                    className="leading-[1.75] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.investigationOpening}
                  </p>
                </div>
              )}

              {story.suspensefulDevelopments?.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    Developments
                  </h3>
                  <ul className="list-disc pl-6 space-y-1.5">
                    {story.suspensefulDevelopments.map((d, i) => (
                      <li
                        key={i}
                        className="leading-[1.7]"
                        style={{ fontSize: 14.5, color: C.heading }}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {story.finalChallenge && (
                <div
                  className="rounded-[10px] p-4"
                  style={{
                    background: "rgba(245,185,66,.08)",
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-semibold mb-2"
                    style={{ fontSize: 17, color: C.gold }}
                  >
                    Your Final Challenge
                  </h3>
                  <p
                    className="leading-[1.7] whitespace-pre-line"
                    style={{ fontSize: 14.5, color: C.heading }}
                  >
                    {story.finalChallenge}
                  </p>
                </div>
              )}
            </>
          )}
        </Section>
      );
    }

    // ---------- CHARACTERS ----------
    if (activeTab === "characters") {
      return (
        <Section>
          <SectionHeader
            icon={Users}
            title={`The Suspects (${characters.length})`}
            subtitle="Click any portrait to open the full dossier"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="suspects"
            fileName="Suspect_Cards.pdf"
            description="Export every suspect profile as a printable dossier PDF."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {characters.map((c) => {
              const portraitUrl = portraitMap[c.id] || null;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCharacter(c)}
                  className="group rounded-[12px] overflow-hidden text-left transition-all hover:-translate-y-[3px]"
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.input,
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(245,185,66,.18)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: "3 / 4",
                      background:
                        "radial-gradient(circle at 50% 40%, #0a1a28, #000000)",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {portraitUrl ? (
                      <img
                        src={portraitUrl}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: "center top" }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <span
                          className="font-['Playfair_Display',Georgia,serif] font-bold"
                          style={{ fontSize: 72, color: C.gold, opacity: 0.6 }}
                        >
                          {c.name?.[0] || "?"}
                        </span>
                      </div>
                    )}

                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,12,22,.85)",
                        border: `1px solid ${C.gold}66`,
                        color: C.gold,
                        fontSize: 9.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".6px",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                      }}
                    >
                      {c.role}
                    </span>

                    <div
                      className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, rgba(0,0,0,.85))",
                      }}
                    >
                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: C.gold,
                          color: C.mainBg,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        <Eye size={13} />
                        View
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <div
                      className="font-['Playfair_Display',Georgia,serif] font-bold truncate"
                      style={{ fontSize: 14, color: C.heading }}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                    <div
                      className="truncate"
                      style={{
                        fontSize: 11.5,
                        color: C.secondary,
                        marginTop: 2,
                      }}
                    >
                      Age {c.age} · {c.occupation}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      );
    }

    // ---------- CLUES ----------
    if (activeTab === "clues") {
      return (
        <Section>
          <SectionHeader
            icon={Search}
            title={`Clues (${clues.length})`}
            subtitle="Every clue matters — some reveal, others deceive"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="clues"
            fileName="Clues_and_Evidence.pdf"
            description="Print all clues and evidence documents in one PDF."
          />

          <div className="space-y-3">
            {clues.map((cl) => {
              const importanceColor =
                cl.importance === "Critical"
                  ? C.danger
                  : cl.importance === "Major"
                  ? C.gold
                  : C.cyan;
              return (
                <div
                  key={cl.id}
                  className="rounded-[10px] p-4"
                  style={{
                    borderLeft: `3px solid ${importanceColor}`,
                    background: C.input,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3
                      className="font-bold"
                      style={{ fontSize: 15, color: C.heading }}
                    >
                      {cl.title}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: 10,
                        background: "rgba(245,185,66,.15)",
                        border: `1px solid ${C.gold}55`,
                        color: C.gold,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      {cl.type}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: 10,
                        background: "transparent",
                        border: `1px solid ${importanceColor}`,
                        color: importanceColor,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      {cl.importance}
                    </span>
                    {cl.isRedHerring && (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          fontSize: 10,
                          background: "rgba(255,143,168,.12)",
                          border: `1px solid ${C.danger}66`,
                          color: C.danger,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".5px",
                        }}
                      >
                        Red Herring
                      </span>
                    )}
                  </div>
                  <p
                    className="leading-[1.65]"
                    style={{ fontSize: 14, color: C.heading }}
                  >
                    {cl.description}
                  </p>
                  {cl.discoveryLocation && (
                    <p
                      className="mt-2 italic"
                      style={{ fontSize: 12, color: C.secondary }}
                    >
                      Found at: {cl.discoveryLocation}
                    </p>
                  )}
                  {cl.hint && (
                    <div className="mt-3">
                      <PuzzleHints hints={[cl.hint]} puzzleId={`clue-${cl.id}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      );
    }

    // ---------- EVIDENCE (sealed-aware) ----------
    if (activeTab === "evidence") {
      return (
        <Section>
          <SectionHeader
            icon={ScrollText}
            title={`Evidence Documents (${evidence.length})`}
            subtitle="Letters, reports, statements — read them all"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="clues"
            fileName="Clues_and_Evidence.pdf"
            description="Evidence documents are bundled with clues in the same PDF."
          />

          <div className="space-y-4">
            {evidence.map((e) =>
              e.isSealed ? (
                <SealedEvidence key={e.id} evidence={e} />
              ) : (
                <div
                  key={e.id}
                  className="rounded-[10px] p-5"
                  style={{
                    border: `1px dashed ${C.border}`,
                    background: C.input,
                  }}
                >
                  <div
                    className="mb-3 pb-3"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        color: C.gold,
                        fontWeight: 700,
                        marginBottom: 3,
                      }}
                    >
                      {e.type}
                    </div>
                    <h3
                      className="font-bold"
                      style={{ fontSize: 16, color: C.heading }}
                    >
                      {e.title}
                    </h3>
                  </div>
                  <div
                    className="whitespace-pre-line leading-[1.75]"
                    style={{
                      fontSize: 14,
                      color: C.heading,
                      fontFamily: "'Courier New', Courier, monospace",
                    }}
                  >
                    {e.body}
                  </div>
                </div>
              )
            )}
          </div>
        </Section>
      );
    }

    // ---------- PUZZLES ----------
    if (activeTab === "puzzles") {
      return (
        <Section>
          <SectionHeader
            icon={Puzzle}
            title={`Puzzles (${puzzles.length})`}
            subtitle="Solve each one to unlock hidden truths"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="puzzles"
            fileName="Puzzle_Sheets.pdf"
            description="Each puzzle prints on its own page with answer space."
          />

          <div className="space-y-4">
            {puzzles.map((p) => (
              <div
                key={p.id}
                className="rounded-[10px] p-5"
                style={{
                  border: `1.5px solid ${C.cyan}66`,
                  background: "rgba(0,213,216,.05)",
                }}
              >
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-bold"
                    style={{ fontSize: 17, color: C.heading }}
                  >
                    {p.title}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontSize: 10,
                      background: "rgba(0,213,216,.15)",
                      border: `1px solid ${C.cyan}66`,
                      color: C.cyan,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    {p.type}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontSize: 10,
                      color: C.cyan,
                      border: `1px solid ${C.cyan}55`,
                    }}
                  >
                    {p.difficulty}
                  </span>
                </div>

                <p
                  className="leading-[1.7] mb-4"
                  style={{ fontSize: 14.5, color: C.heading }}
                >
                  {p.question}
                </p>

                {/* NEVER render p.answer or p.explanation here */}
                <PuzzleHints hints={p.hints} puzzleId={p.id} />
              </div>
            ))}
          </div>
        </Section>
      );
    }

    // ---------- TIMELINE ----------
    if (activeTab === "timeline") {
      return (
        <Section>
          <SectionHeader
            icon={Clock}
            title="Investigation Timeline"
            subtitle="Compare events with each suspect's alibi"
          />

          <PdfBar
            mysteryId={mystery._id}
            kind="instructions"
            fileName="Player_Instructions.pdf"
            description="The timeline is bundled in the Player Instructions PDF."
          />

          <div className="space-y-0">
            {playerTimeline.map((ev, i) => (
              <div
                key={ev.id || i}
                className="flex gap-4 py-3"
                style={{
                  borderBottom:
                    i < playerTimeline.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                }}
              >
                <div
                  className="shrink-0 font-['Playfair_Display',Georgia,serif] font-bold"
                  style={{ fontSize: 15, color: C.gold, minWidth: 72 }}
                >
                  {ev.time}
                </div>
                <div className="flex-1 min-w-0">
                  {ev.location && (
                    <div
                      className="flex items-center gap-1.5 mb-1"
                      style={{
                        fontSize: 11,
                        color: C.secondary,
                        textTransform: "uppercase",
                        letterSpacing: ".8px",
                      }}
                    >
                      <MapPin size={10} />
                      {ev.location}
                    </div>
                  )}
                  <p
                    className="leading-[1.6]"
                    style={{ fontSize: 14, color: C.heading }}
                  >
                    {ev.description || ev.event}
                  </p>
                  {ev.source && (
                    <p
                      className="mt-1 italic"
                      style={{ fontSize: 11.5, color: C.secondary }}
                    >
                      Source: {ev.source}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      );
    }

    return null;
  };

  // ================================================================
  // MAIN RENDER
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
          <div className="max-w-[1800px] mx-auto px-5 py-5">
            {/* BACK LINK */}
            <button
              type="button"
              onClick={() => navigate("/my-mysteries")}
              className="inline-flex items-center gap-2 mb-4 text-[13px] font-medium transition-colors"
              style={{ color: C.secondary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
            >
              <ArrowLeft size={15} />
              Back to My Mysteries
            </button>

            {/* HERO */}
            <section
              className="relative overflow-hidden rounded-[12px] mb-4"
              style={{ background: "#000000" }}
            >
              {coverUrl && (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverUrl})` }}
                />
              )}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.75)_45%,rgba(0,0,0,.55)_100%)]" />

              <div className="relative z-10 grid md:grid-cols-[220px_1fr] gap-6 items-center p-6 md:p-7">
                <div
                  className="hidden md:block rounded-[10px] overflow-hidden shrink-0"
                  style={{
                    height: 280,
                    border: `1px solid ${C.gold}55`,
                    background: "#000000",
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <Gift size={40} style={{ color: C.gold }} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div
                    className="inline-flex items-center gap-2 mb-3 px-[14px] py-[6px] rounded-full"
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
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: C.gold,
                        boxShadow: `0 0 8px ${C.gold}`,
                      }}
                    />
                    {genre}
                  </div>

                  <h1
                    className="font-['Playfair_Display',Georgia,serif] font-medium mb-3"
                    style={{
                      fontSize: "clamp(24px, 3.5vw, 36px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.5px",
                      color: "#ffffff",
                    }}
                  >
                    {title}
                  </h1>

                  <div
                    className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5"
                    style={{ fontSize: 12.5, color: C.heading }}
                  >
                    <span>
                      <strong style={{ color: C.gold }}>Setting:</strong>{" "}
                      {setting}
                    </span>
                    <span>
                      <strong style={{ color: C.gold }}>Difficulty:</strong>{" "}
                      {difficulty}
                    </span>
                    <span>
                      <strong style={{ color: C.gold }}>Players:</strong>{" "}
                      {playerCount}
                    </span>
                    <span>
                      <strong style={{ color: C.gold }}>Duration:</strong>{" "}
                      {duration} min
                    </span>
                    <span>
                      <strong style={{ color: C.gold }}>Audience:</strong>{" "}
                      {targetAudience}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!isReady || downloading}
                      className="flex items-center h-[44px] px-[18px] gap-2 text-[13.5px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-[1px]"
                      style={{
                        background: isReady ? C.gold : C.input,
                        color: isReady ? C.mainBg : C.secondary,
                        border: isReady
                          ? `1px solid ${C.goldHover}`
                          : `1px solid ${C.border}`,
                        borderRadius: 11,
                        boxShadow: isReady
                          ? "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(245,185,66,.35)"
                          : "none",
                      }}
                      onMouseEnter={(e) =>
                        isReady &&
                        !downloading &&
                        (e.currentTarget.style.background = C.goldHover)
                      }
                      onMouseLeave={(e) =>
                        isReady && (e.currentTarget.style.background = C.gold)
                      }
                    >
                      {downloading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Building Kit...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Download Complete Kit
                        </>
                      )}
                    </button>

                    {generationStatus === "needs_review" && (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px]"
                        style={{
                          background: "rgba(245,185,66,.12)",
                          border: `1px solid ${C.gold}55`,
                          color: C.gold,
                          fontSize: 12,
                        }}
                      >
                        <AlertCircle size={13} />
                        Needs Review (exportable)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* TAB BAR */}
            <div
              className="rounded-[12px] p-2 mb-4 overflow-x-auto"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2 min-w-max">
                {tabs.map((t) => (
                  <TabButton
                    key={t.id}
                    active={activeTab === t.id}
                    icon={t.icon}
                    label={t.label}
                    count={t.count}
                    onClick={() => setActiveTab(t.id)}
                  />
                ))}
              </div>
            </div>

            {/* TAB CONTENT */}
            <div key={activeTab} style={{ animation: "tabFade .25s ease-out" }}>
              {renderTab()}
            </div>

            {/* FOOTER CTA */}
            {activeTab === "overview" && (
              <div
                className="rounded-[12px] p-6 mt-4 flex flex-wrap items-center gap-4 justify-between"
                style={{
                  background: C.card,
                  border: `1px solid ${C.gold}55`,
                }}
              >
                <div>
                  <h3
                    className="font-['Playfair_Display',Georgia,serif] font-bold mb-1"
                    style={{ fontSize: 20, color: C.heading }}
                  >
                    Ready to play?
                  </h3>
                  <p style={{ fontSize: 13.5, color: C.secondary }}>
                    Download the complete kit — all PDFs, images and the Game
                    Master guide in one ZIP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!isReady || downloading}
                  className="flex items-center h-[48px] px-[22px] gap-2.5 text-[14px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-[1px]"
                  style={{
                    background: isReady ? C.gold : C.input,
                    color: isReady ? C.mainBg : C.secondary,
                    border: isReady
                      ? `1px solid ${C.goldHover}`
                      : `1px solid ${C.border}`,
                    borderRadius: 11,
                    boxShadow: isReady
                      ? "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(245,185,66,.35)"
                      : "none",
                  }}
                  onMouseEnter={(e) =>
                    isReady &&
                    !downloading &&
                    (e.currentTarget.style.background = C.goldHover)
                  }
                  onMouseLeave={(e) =>
                    isReady && (e.currentTarget.style.background = C.gold)
                  }
                >
                  {downloading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Download size={17} />
                      Download Kit
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============ CHARACTER MODAL ============ */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          portraitUrl={portraitMap[selectedCharacter.id] || null}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      <style>{`
        @keyframes tabFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// 🎭 CHARACTER MODAL — portrait left, details right
// ================================================================
function CharacterModal({ character, portraitUrl, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const c = character;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(8,13,19,.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "modalFade .2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[900px] rounded-[20px] overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{
          background: C.card,
          border: `1px solid ${C.gold}55`,
          boxShadow: `0 30px 100px rgba(0,0,0,.8), 0 0 60px rgba(245,185,66,.1)`,
          animation: "modalPop .25s cubic-bezier(.2,.7,.3,1)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid place-items-center w-9 h-9 rounded-full transition-colors"
          style={{
            background: "rgba(0,12,22,.9)",
            border: `1px solid ${C.border}`,
            color: C.secondary,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = C.gold;
            e.currentTarget.style.borderColor = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = C.secondary;
            e.currentTarget.style.borderColor = C.border;
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[320px_1fr]">
          {/* LEFT — Portrait */}
          <div
            className="relative"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #0a1a28, #000000)",
              minHeight: 420,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span
                  className="font-['Playfair_Display',Georgia,serif] font-bold"
                  style={{ fontSize: 96, color: C.gold, opacity: 0.4 }}
                >
                  {c.name?.[0] || "?"}
                </span>
              </div>
            )}

            <div
              className="absolute inset-x-0 bottom-0 p-5"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(0,0,0,.92))",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1.6px",
                  color: C.gold,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {c.role}
              </div>
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold"
                style={{
                  fontSize: 24,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  textShadow: "0 2px 12px rgba(0,0,0,.8)",
                }}
              >
                {c.name}
              </div>
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="p-6 md:p-8">
            <div
              style={{
                fontSize: 13,
                color: C.secondary,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Age <strong style={{ color: C.heading }}>{c.age}</strong>
              {c.occupation && (
                <>
                  {" · "}
                  <strong style={{ color: C.heading }}>{c.occupation}</strong>
                </>
              )}
            </div>

            <div className="space-y-4">
              {c.personality && (
                <DetailBlock
                  icon={Star}
                  label="Personality"
                  value={c.personality}
                />
              )}
              {c.background && (
                <DetailBlock
                  icon={FileText}
                  label="Background"
                  value={c.background}
                />
              )}
              {c.motive && (
                <DetailBlock
                  icon={AlertCircle}
                  label="Possible Motive"
                  value={c.motive}
                />
              )}
              {c.alibi && (
                <DetailBlock
                  icon={Clock}
                  label="Stated Alibi"
                  value={c.alibi}
                />
              )}

              {c.publicInformation?.appearance && (
                <DetailBlock
                  icon={Eye}
                  label="Appearance"
                  value={c.publicInformation.appearance}
                />
              )}
              {c.publicInformation?.mannerisms && (
                <DetailBlock
                  icon={Users}
                  label="Mannerisms"
                  value={c.publicInformation.mannerisms}
                />
              )}

              {c.publicInformation?.knownFacts?.length > 0 && (
                <div>
                  <div
                    className="flex items-center gap-2 mb-2"
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1.4px",
                      color: C.gold,
                      fontWeight: 700,
                    }}
                  >
                    <Lightbulb size={12} />
                    Known Facts
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {c.publicInformation.knownFacts.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2"
                        style={{
                          fontSize: 13,
                          color: C.heading,
                          lineHeight: 1.55,
                        }}
                      >
                        <span
                          style={{
                            color: C.gold,
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        >
                          ◆
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.privateInformation?.secret && (
                <div
                  className="rounded-[10px] p-4 mt-4"
                  style={{
                    background: "rgba(255,95,126,.08)",
                    border: "1px solid rgba(255,95,126,.3)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 mb-2"
                    style={{
                      color: C.danger,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                    }}
                  >
                    <Lock size={12} />
                    Secret (GM only)
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#ffb2c4",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {c.privateInformation.secret}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalPop {
          from { transform: scale(.94); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// 📋 Detail block
// ================================================================
function DetailBlock({ icon: Icon, label, value }) {
  return (
    <div>
      <div
        className="flex items-center gap-2 mb-1.5"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: C.gold,
          fontWeight: 700,
        }}
      >
        <Icon size={12} />
        {label}
      </div>
      <p
        style={{
          fontSize: 13.5,
          color: C.heading,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
