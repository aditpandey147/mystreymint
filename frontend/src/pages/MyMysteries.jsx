// frontend/src/pages/MyMysteries.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Clock,
  Users,
  Trash2,
  Eye,
  Download,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Gift,
  X,
  TriangleAlert,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
import myMysteriesBg from "../assets/images/my-mysteries-bg.png";

// ================================================================
// LUXURY DETECTIVE THEME
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
  dangerDeep: "#ff5f7e",
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}${clean}`;
};

const READY_STATUSES = ["completed", "needs_review"];
const isMysteryReady = (status) => READY_STATUSES.includes(status);

// ================================================================
// CIRCULAR PROGRESS RING
// ================================================================
function CircularProgress({ progress = 0, size = 140, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  const offset = circumference * (1 - safe / 100);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{
          animation: "spinSlow 8s linear infinite",
          opacity: 0.35,
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 6}
          fill="none"
          stroke={C.gold}
          strokeWidth={1}
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
      </svg>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(42,59,72,.6)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#mmProgressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset .9s cubic-bezier(.2,.7,.3,1)",
            filter: `drop-shadow(0 0 6px ${C.gold}aa)`,
          }}
        />

        <defs>
          <linearGradient
            id="mmProgressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={C.goldHover} />
            <stop offset="50%" stopColor={C.gold} />
            <stop offset="100%" stopColor={C.darkGold} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
        <div>
          <div
            className="font-bold tabular-nums leading-none"
            style={{
              fontSize: size * 0.26,
              color: C.gold,
              textShadow: `0 0 20px ${C.gold}80`,
              transition: "color .3s",
            }}
          >
            {safe}
          </div>
          <div
            className="mt-1.5 uppercase tracking-[1.6px] font-semibold"
            style={{ fontSize: 9.5, color: C.secondary }}
          >
            Percent
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// ANIMATED STAGE TEXT
// ================================================================
function StageText({ text }) {
  const [display, setDisplay] = useState(text || "Generating...");

  useEffect(() => {
    if (text && text !== display) {
      setDisplay(text);
    }
  }, [text, display]);

  return (
    <div
      className="mt-3 font-semibold"
      style={{
        fontSize: 12.5,
        color: C.gold,
        maxWidth: 220,
        marginLeft: "auto",
        marginRight: "auto",
        minHeight: 16,
        animation: "stagePulse 2s ease-in-out infinite",
      }}
    >
      {display}
      <style>{`
        @keyframes stagePulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .65; }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// DELETE CONFIRMATION MODAL
// ================================================================
function DeleteConfirmModal({ open, title, loading, onCancel, onConfirm }) {
  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(8,13,19,.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "modalFade .2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="relative w-full max-w-[440px] rounded-[20px] overflow-hidden"
        style={{
          background: C.card,
          border: `1px solid ${C.danger}55`,
          boxShadow: `0 30px 100px rgba(0,0,0,.8), 0 0 60px rgba(255,95,126,.15)`,
          animation: "modalPop .25s cubic-bezier(.2,.7,.3,1)",
        }}
      >
        {/* Close X */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 z-20 grid place-items-center w-8 h-8 rounded-full transition-colors disabled:opacity-40"
          style={{ color: C.secondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.input)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label="Close"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        <div className="relative px-7 pt-8 pb-7 text-center">
          {/* Icon */}
          <div
            className="relative mx-auto mb-5 grid place-items-center"
            style={{ width: 84, height: 84 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,95,126,.25), transparent 70%)",
                animation: "warningPulse 2s ease-in-out infinite",
              }}
            />
            <div
              className="absolute inset-2 rounded-full grid place-items-center"
              style={{
                background: "rgba(255,95,126,.12)",
                border: `1px solid ${C.danger}66`,
              }}
            >
              <TriangleAlert
                size={36}
                strokeWidth={1.8}
                style={{ color: C.danger }}
              />
            </div>
          </div>

          <h3
            id="delete-modal-title"
            className="font-['Playfair_Display',Georgia,serif] font-bold mb-2"
            style={{ fontSize: 22, color: C.heading }}
          >
            Delete this mystery?
          </h3>

          <p
            className="leading-[1.6] mb-5"
            style={{ fontSize: 13.5, color: C.secondary }}
          >
            <span className="font-semibold" style={{ color: C.heading }}>
              {title}
            </span>
            <br />
            will be permanently removed along with all generated content,
            images, and exports. This action cannot be undone.
          </p>

          {/* Warning chip */}
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px]"
            style={{
              background: "rgba(255,95,126,.08)",
              border: `1px solid ${C.danger}45`,
            }}
          >
            <AlertCircle size={13} style={{ color: C.danger }} />
            <span
              style={{
                fontSize: 12,
                color: C.danger,
                fontWeight: 600,
              }}
            >
              This action is irreversible
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-[46px] rounded-[11px] text-[13.5px] font-semibold transition-all disabled:opacity-50"
              style={{
                background: C.input,
                color: C.heading,
                border: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.background = C.card)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = C.input)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-[46px] rounded-[11px] text-[13.5px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(115deg, ${C.danger}, ${C.dangerDeep})`,
                color: "#0b0208",
                border: `1px solid ${C.danger}`,
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(255,95,126,.3)",
              }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.filter = "brightness(1.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete Mystery
                </>
              )}
            </button>
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
          @keyframes warningPulse {
            0%, 100% { transform: scale(1); opacity: .8; }
            50%      { transform: scale(1.08); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function MyMysteries() {
  const navigate = useNavigate();
  const [mysteries, setMysteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // ---- Delete confirmation state ----
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, title }

  const fetchMysteries = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get("/mysteries");
      if (res.data?.success) {
        setMysteries(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load mysteries:", err);
      if (!silent) {
        toast.error(err.response?.data?.message || "Failed to load mysteries");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + poll every 3s while any mystery is still generating
  useEffect(() => {
    fetchMysteries();

    const interval = setInterval(() => {
      setMysteries((current) => {
        const anyPending = current.some(
          (m) =>
            m.generationStatus === "generating" ||
            m.generationStatus === "pending" ||
            m.generationStatus === "validating",
        );
        if (anyPending) fetchMysteries(true);
        return current;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMysteries]);

  // ---- Open the delete modal instead of window.confirm ----
  const openDeleteModal = (id, title) => {
    setDeleteTarget({ _id: id, title });
  };

  // ---- Confirm delete ----
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { _id, title } = deleteTarget;

    try {
      setDeletingId(_id);
      await api.delete(`/mysteries/${_id}`);
      setMysteries((prev) => prev.filter((m) => m._id !== _id));
      toast.success(`"${title}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (mysteryId, title) => {
    try {
      setDownloadingId(mysteryId);
      toast.loading("Preparing your kit... This may take 30-60 seconds.", {
        id: `dl-${mysteryId}`,
      });

      const buildRes = await api.post(`/mysteries/${mysteryId}/export`);
      if (!buildRes.data?.success) {
        throw new Error(buildRes.data?.message || "Export failed");
      }

      const zipInfo = buildRes.data.zip;
      if (!zipInfo?.downloadUrl) throw new Error("ZIP not available");

      const zipRes = await api.get(zipInfo.downloadUrl, {
        responseType: "blob",
        timeout: 120000,
      });

      const blob = new Blob([zipRes.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", zipInfo.fileName || `${title}.zip`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Kit downloaded!", { id: `dl-${mysteryId}` });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to prepare kit",
        { id: `dl-${mysteryId}` },
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = mysteries.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.title?.toLowerCase().includes(q) ||
      m.genre?.toLowerCase().includes(q) ||
      m.setting?.toLowerCase().includes(q)
    );
  });

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
            {/* HERO — bg image + bigger padding */}
            <section
              className="rounded-[12px] overflow-hidden relative mb-5"
              style={{
                background: "#000000",
                paddingTop: "52px",
                paddingBottom: "52px",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
            >
              {/* ===== BACKGROUND IMAGE ===== */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-[center_right] bg-no-repeat"
                style={{
                  backgroundImage: `url(${myMysteriesBg})`,
                }}
              />

              {/* ===== DARK GRADIENT OVERLAY ===== */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.72)_45%,rgba(0,0,0,.35)_82%,rgba(0,0,0,.15)_100%)]" />

              {/* ===== SOFT BOTTOM FADE ===== */}
              <div className="absolute inset-x-0 bottom-0 z-[1] h-[40%] pointer-events-none bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.45))]" />

              {/* ===== CONTENT ===== */}
              <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  {/* Eyebrow */}
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
                    Your Library
                  </div>

                  {/* Heading */}
                  <h1
                    className="font-['Playfair_Display',Georgia,serif] mb-3"
                    style={{
                      fontSize: "clamp(32px,5.5vw,54px)",
                      lineHeight: 1.08,
                      letterSpacing: "-0.5px",
                      fontWeight: 500,
                      color: "#ffffff",
                      maxWidth: 640,
                    }}
                  >
                    My{" "}
                    <em className="not-italic" style={{ color: C.gold }}>
                      Mysteries
                    </em>
                  </h1>

                  {/* Description */}
                  <p
                    className="leading-[26px] max-w-[620px] mb-4"
                    style={{
                      fontSize: "clamp(14px,1.6vw,17px)",
                      color: C.heading,
                    }}
                  >
                    Every mystery game kit you&apos;ve created — ready to
                    preview, download and play.
                  </p>

                  {/* Stats badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
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
                      {mysteries.length}{" "}
                      {mysteries.length === 1 ? "Mystery" : "Mysteries"}
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
                      {
                        mysteries.filter(
                          (m) => m.generationStatus === "completed",
                        ).length
                      }{" "}
                      Ready
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
                      <Loader2 size={12} />
                      {
                        mysteries.filter(
                          (m) =>
                            m.generationStatus === "generating" ||
                            m.generationStatus === "pending" ||
                            m.generationStatus === "validating",
                        ).length
                      }{" "}
                      In Progress
                    </span>
                  </div>

                  {/* Feature bullets */}
                  <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[12px]">
                    {[
                      "AI-generated kits",
                      "PDF + ZIP exports",
                      "Preview any time",
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

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Primary — Gold gradient */}
                  <button
                    type="button"
                    onClick={() => navigate("/create-mystery")}
                    className="flex items-center justify-center h-[50px] px-[22px] gap-2.5 text-[14px] font-bold text-[#000C16] bg-[linear-gradient(135deg,#FFD36D_0%,#F6C55D_50%,#B77B32_100%)] border border-[#FFD36D] rounded-[11px] shadow-[inset_0_1px_1px_rgba(255,255,255,.25),0_8px_22px_rgba(246,197,93,.35)] transition-all hover:-translate-y-[1px] hover:brightness-110 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,.35),0_10px_28px_rgba(246,197,93,.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    Create New Mystery
                  </button>

                  {/* Secondary — Dark with gold border */}
                  <button
                    type="button"
                    onClick={() => navigate("/templates")}
                    className="flex items-center justify-center h-[50px] px-[20px] gap-2.5 text-[14px] font-semibold rounded-[11px] transition-all hover:-translate-y-[1px]"
                    style={{
                      background: "rgba(3,21,32,.8)",
                      color: C.gold,
                      border: `1px solid ${C.gold}66`,
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(246,197,93,.15)";
                      e.currentTarget.style.color = C.goldHover;
                      e.currentTarget.style.borderColor = C.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(3,21,32,.8)";
                      e.currentTarget.style.color = C.gold;
                      e.currentTarget.style.borderColor = `${C.gold}66`;
                    }}
                  >
                    Browse Templates
                  </button>
                </div>
              </div>
            </section>

            {/* SEARCH */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-[520px]">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.gold }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your mysteries..."
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

              <div
                className="text-[12.5px] font-medium"
                style={{ color: C.secondary }}
              >
                {mysteries.length}{" "}
                {mysteries.length === 1 ? "mystery" : "mysteries"}
              </div>
            </div>

            {/* LIST */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
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
            ) : filtered.length === 0 ? (
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
                  {search ? "No matches found" : "No mysteries yet"}
                </h3>
                <p
                  className="leading-[1.6] mb-6 max-w-[420px] mx-auto"
                  style={{ fontSize: 14, color: C.secondary }}
                >
                  {search
                    ? "Try a different keyword or clear the search."
                    : "Create your first AI-powered mystery game kit — characters, clues, puzzles, evidence and solution included."}
                </p>
                {!search && (
                  <button
                    type="button"
                    onClick={() => navigate("/create-mystery")}
                    className="inline-flex items-center h-[48px] px-[22px] gap-2.5 text-[14px] font-bold rounded-[11px]"
                    style={{
                      background: C.gold,
                      color: C.mainBg,
                      border: `1px solid ${C.goldHover}`,
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)",
                    }}
                  >
                    <Sparkles size={17} />
                    Generate My First Mystery
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {filtered.map((m) => {
                  const cover = m.images?.cover
                    ? getImageUrl(m.images.cover)
                    : null;
                  const ready = isMysteryReady(m.generationStatus);
                  const isGenerating =
                    m.generationStatus === "generating" ||
                    m.generationStatus === "pending" ||
                    m.generationStatus === "validating";

                  return (
                    <div
                      key={m._id}
                      className="rounded-[12px] overflow-hidden transition-all hover:-translate-y-[2px]"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {/* COVER / PROGRESS */}
                      <div
                        className="relative"
                        style={{
                          height: 260,
                          background: "#000000",
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {cover && (
                          <img
                            src={cover}
                            alt={m.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                              filter: isGenerating ? "blur(14px)" : "none",
                              opacity: isGenerating ? 0.28 : 1,
                              transform: isGenerating
                                ? "scale(1.1)"
                                : "scale(1)",
                              transition:
                                "filter .5s, opacity .5s, transform .5s",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}

                        {!cover && !isGenerating && (
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
                              <Gift size={28} style={{ color: C.gold }} />
                            </div>
                          </div>
                        )}

                        {isGenerating && (
                          <div
                            className="absolute inset-0 grid place-items-center"
                            style={{
                              background:
                                "radial-gradient(circle at 50% 50%, rgba(8,13,19,.55), rgba(8,13,19,.92))",
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                            }}
                          >
                            <div className="text-center px-4">
                              <CircularProgress
                                progress={m.generationProgress || 5}
                                size={140}
                                stroke={10}
                              />
                              <StageText
                                text={m.currentStage || "Preparing..."}
                              />
                              <div
                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                                style={{
                                  background: "rgba(245,185,66,.08)",
                                  border: `1px solid ${C.gold}40`,
                                  fontSize: 10.5,
                                  color: C.secondary,
                                }}
                              >
                                <Loader2 size={10} className="animate-spin" />
                                This may take 2–4 minutes
                              </div>
                            </div>
                          </div>
                        )}

                        {ready && m.generationStatus === "completed" && (
                          <div
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(0,213,216,.15)",
                              border: `1px solid ${C.cyan}66`,
                              color: C.cyan,
                              fontSize: 11,
                              fontWeight: 600,
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                            }}
                          >
                            <CheckCircle2 size={11} />
                            Ready
                          </div>
                        )}

                        {m.generationStatus === "needs_review" && (
                          <div
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(245,185,66,.15)",
                              border: `1px solid ${C.gold}66`,
                              color: C.gold,
                              fontSize: 11,
                              fontWeight: 600,
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                            }}
                          >
                            <AlertCircle size={11} />
                            Review
                          </div>
                        )}

                        {m.generationStatus === "failed" && (
                          <div
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(255,143,168,.15)",
                              border: "1px solid rgba(255,143,168,.4)",
                              color: "#ff8fa8",
                              fontSize: 11,
                              fontWeight: 600,
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                            }}
                          >
                            <AlertCircle size={11} />
                            Failed
                          </div>
                        )}
                      </div>

                      {/* BODY */}
                      <div style={{ padding: 16 }}>
                        <h3
                          className="font-semibold truncate mb-1.5"
                          style={{ fontSize: 15, color: C.heading }}
                          title={m.title}
                        >
                          {m.title}
                        </h3>

                        <div
                          className="flex items-center flex-wrap gap-2 mb-3"
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
                            {m.genre}
                          </span>
                          <span>{m.setting}</span>
                        </div>

                        <div
                          className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mb-4"
                          style={{ fontSize: 11.5, color: C.secondary }}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={11} /> {m.playerCount}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={11} /> {m.duration} min
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isGenerating ? (
                            <button
                              type="button"
                              disabled
                              className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] font-semibold cursor-not-allowed"
                              style={{
                                background: "rgba(245,185,66,.08)",
                                color: C.gold,
                                border: `1px solid ${C.gold}45`,
                                fontSize: 13,
                              }}
                            >
                              <Loader2 size={14} className="animate-spin" />
                              Generating...
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/mystery/${m._id}`)}
                              className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] font-bold transition-all hover:-translate-y-[1px]"
                              style={{
                                background: C.gold,
                                color: C.mainBg,
                                border: `1px solid ${C.goldHover}`,
                                fontSize: 13.5,
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
                              <Eye size={15} />
                              View Mystery
                            </button>
                          )}

                          {ready && (
                            <button
                              type="button"
                              onClick={() => handleDownload(m._id, m.title)}
                              disabled={downloadingId === m._id}
                              className="grid place-items-center w-[42px] h-[42px] rounded-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                background: C.input,
                                border: `1px solid ${C.border}`,
                                color: C.gold,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = C.card;
                                e.currentTarget.style.borderColor = C.gold;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = C.input;
                                e.currentTarget.style.borderColor = C.border;
                              }}
                              aria-label="Download kit"
                            >
                              {downloadingId === m._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Download size={15} />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openDeleteModal(m._id, m.title)}
                            className="grid place-items-center w-[42px] h-[42px] rounded-[10px] transition-colors"
                            style={{
                              background: C.input,
                              border: `1px solid ${C.border}`,
                              color: "#ff8fa8",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255,143,168,.12)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,143,168,.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = C.input;
                              e.currentTarget.style.borderColor = C.border;
                            }}
                            aria-label="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============ DELETE CONFIRM MODAL ============ */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        title={deleteTarget?.title || ""}
        loading={deletingId === deleteTarget?._id}
        onCancel={() => {
          if (deletingId) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
