// frontend/src/pages/ClueEvidenceStudio.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Search,
  FileText,
  Trash2,
  Eye,
  X,
  Lightbulb,
  Plus,
  ScrollText,
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import clueStudioBg from "../../assets/images/clue-studio-bg.png";

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
// 🎯 OPTIONS
// ================================================================
const CLUE_TYPES = [
  "Any",
  "Physical Evidence",
  "Testimony",
  "Document",
  "Observation",
  "Forensic",
];
const IMPORTANCES = ["Critical", "Major", "Minor"];
const EVIDENCE_TYPES = [
  "Any",
  "Witness Statement",
  "Letter",
  "Diary Entry",
  "Security Report",
  "Receipt",
  "Record",
  "Newspaper Article",
  "Investigation Report",
  "Photographic Evidence",
];
const GENRES = [
  "Murder Mystery",
  "Detective Mystery",
  "Spy Thriller",
  "Horror Mystery",
  "Sci-Fi Mystery",
  "Historical Mystery",
];
const ERAS = [
  "1920s",
  "Victorian",
  "Modern",
  "Futuristic",
  "Medieval",
  "Post-War",
];

// ================================================================
// 📥 DOWNLOAD HELPER
// ================================================================
async function downloadImage(url, filename) {
  try {
    toast.loading("Downloading…", { id: "dl-img" });
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
    toast.success("Image downloaded", { id: "dl-img" });
  } catch (err) {
    console.error("Download failed:", err);
    toast.error("Download failed", { id: "dl-img" });
  }
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function ClueEvidenceStudio() {
  const [activeTab, setActiveTab] = useState("clues");
  const [clues, setClues] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ---- Clue form ----
  const [clueForm, setClueForm] = useState({
    genre: "Murder Mystery",
    setting: "Luxury Hotel",
    era: "1920s",
    difficulty: "Medium",
    clueType: "Any",
    importance: "Major",
    isRedHerring: false,
    prompt: "",
    includeImage: true,
  });

  // ---- Evidence form ----
  const [evidenceForm, setEvidenceForm] = useState({
    genre: "Murder Mystery",
    setting: "Luxury Hotel",
    era: "1920s",
    evidenceType: "Any",
    prompt: "",
    includeImage: true,
  });

  // ================================================================
  // FETCH
  // ================================================================
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await api.get("/clue-studio");
      if (res.data?.success) {
        setClues(res.data.clues || []);
        setEvidence(res.data.evidence || []);
      }
    } catch (err) {
      console.error("Failed to load:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================================================================
  // GENERATE CLUE
  // ================================================================
  const handleGenerateClue = async () => {
    if (generating) return;
    try {
      setGenerating(true);
      toast.loading("Crafting your clue…", { id: "gen-clue" });

      const res = await api.post("/clue-studio/clues/generate", clueForm, {
        timeout: 120000,
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed");

      toast.success("Clue created!", { id: "gen-clue" });
      setClues((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Clue generation failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to generate",
        { id: "gen-clue" },
      );
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // GENERATE EVIDENCE
  // ================================================================
  const handleGenerateEvidence = async () => {
    if (generating) return;
    try {
      setGenerating(true);
      toast.loading("Crafting your evidence…", { id: "gen-evidence" });

      const res = await api.post(
        "/clue-studio/evidence/generate",
        evidenceForm,
        {
          timeout: 120000,
        },
      );
      if (!res.data?.success) throw new Error(res.data?.message || "Failed");

      toast.success("Evidence created!", { id: "gen-evidence" });
      setEvidence((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Evidence generation failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to generate",
        { id: "gen-evidence" },
      );
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // DELETE
  // ================================================================
  const handleDelete = async (kind, id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/clue-studio/${kind}/${id}`);
      if (kind === "clues") setClues((p) => p.filter((c) => c.id !== id));
      else setEvidence((p) => p.filter((e) => e.id !== id));
      toast.success("Deleted");
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // ================================================================
  // FILTER
  // ================================================================
  const filterFn = (item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.body?.toLowerCase().includes(q)
    );
  };

  const filteredClues = clues.filter(filterFn);
  const filteredEvidence = evidence.filter(filterFn);

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
            {/* HERO */}
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
                  backgroundImage: `url(${clueStudioBg})`,
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
                  Clue & Evidence Studio
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
                  Build Your{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Evidence
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[620px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Generate richly detailed clues and evidence documents —
                  complete with cinematic visuals — for any mystery.
                </p>

                <div className="flex flex-wrap items-center mt-6 gap-x-[26px] gap-y-[14px]">
                  {[
                    "AI-generated clues",
                    "Evidence documents",
                    "Cinematic visuals",
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
                      >
                        <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-1 14.4L4.6 10l1.4-1.4 3 3 6-6L16.4 7 9 14.4z" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* TAB BAR */}
            <div
              className="rounded-[12px] p-2 mb-4 inline-flex gap-2"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              {[
                {
                  id: "clues",
                  label: "Clues",
                  icon: Search,
                  count: clues.length,
                },
                {
                  id: "evidence",
                  label: "Evidence",
                  icon: ScrollText,
                  count: evidence.length,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 h-[42px] px-[16px] rounded-[10px] text-[13px] font-semibold transition-all"
                  style={{
                    background: activeTab === t.id ? C.gold : "transparent",
                    color: activeTab === t.id ? C.mainBg : C.secondary,
                    border:
                      activeTab === t.id
                        ? `1px solid ${C.goldHover}`
                        : `1px solid ${C.border}`,
                  }}
                >
                  <t.icon size={15} />
                  {t.label}
                  <span
                    className="px-1.5 rounded-full"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background:
                        activeTab === t.id
                          ? "rgba(0,0,0,.2)"
                          : "rgba(246,197,93,.15)",
                      color: activeTab === t.id ? C.mainBg : C.gold,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
              {/* ===== LEFT — GENERATOR ===== */}
              <section
                className="rounded-[12px] p-5"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                {activeTab === "clues" ? (
                  <>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="grid place-items-center"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "rgba(246,197,93,.12)",
                          border: `1px solid ${C.gold}55`,
                        }}
                      >
                        <Search size={18} style={{ color: C.gold }} />
                      </div>
                      <div>
                        <h2
                          className="font-bold"
                          style={{ fontSize: 15, color: C.heading }}
                        >
                          Generate Clue
                        </h2>
                        <p style={{ fontSize: 11.5, color: C.secondary }}>
                          Fill in the details and let AI craft a clue
                        </p>
                      </div>
                    </div>

                    <Field label="Genre">
                      <select
                        value={clueForm.genre}
                        onChange={(e) =>
                          setClueForm({ ...clueForm, genre: e.target.value })
                        }
                        className="w-full outline-none"
                        style={fieldStyle}
                      >
                        {GENRES.map((g) => (
                          <option key={g} style={optionStyle}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Setting">
                      <input
                        value={clueForm.setting}
                        onChange={(e) =>
                          setClueForm({ ...clueForm, setting: e.target.value })
                        }
                        placeholder="e.g. Luxury Hotel"
                        className="w-full outline-none"
                        style={fieldStyle}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Field label="Era">
                        <select
                          value={clueForm.era}
                          onChange={(e) =>
                            setClueForm({ ...clueForm, era: e.target.value })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {ERAS.map((e) => (
                            <option key={e} style={optionStyle}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Difficulty">
                        <select
                          value={clueForm.difficulty}
                          onChange={(e) =>
                            setClueForm({
                              ...clueForm,
                              difficulty: e.target.value,
                            })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {["Easy", "Medium", "Hard"].map((d) => (
                            <option key={d} style={optionStyle}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Field label="Clue Type">
                        <select
                          value={clueForm.clueType}
                          onChange={(e) =>
                            setClueForm({
                              ...clueForm,
                              clueType: e.target.value,
                            })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {CLUE_TYPES.map((t) => (
                            <option key={t} style={optionStyle}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Importance">
                        <select
                          value={clueForm.importance}
                          onChange={(e) =>
                            setClueForm({
                              ...clueForm,
                              importance: e.target.value,
                            })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {IMPORTANCES.map((i) => (
                            <option key={i} style={optionStyle}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Extra Prompt (optional)">
                      <textarea
                        value={clueForm.prompt}
                        onChange={(e) =>
                          setClueForm({ ...clueForm, prompt: e.target.value })
                        }
                        rows={3}
                        placeholder="e.g. A torn piece of fabric found near the wine cellar"
                        className="w-full outline-none resize-none"
                        style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                      />
                    </Field>

                    <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={clueForm.isRedHerring}
                        onChange={(e) =>
                          setClueForm({
                            ...clueForm,
                            isRedHerring: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#F6C55D]"
                      />
                      <span style={{ fontSize: 12, color: C.secondary }}>
                        Make this a red herring
                      </span>
                    </label>

                    <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={clueForm.includeImage}
                        onChange={(e) =>
                          setClueForm({
                            ...clueForm,
                            includeImage: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#F6C55D]"
                      />
                      <span style={{ fontSize: 12, color: C.secondary }}>
                        Generate AI image
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateClue}
                      disabled={generating}
                      className="w-full flex items-center justify-center gap-2 rounded-[10px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        height: 50,
                        background: C.goldGradient,
                        color: C.mainBg,
                        border: `1px solid ${C.goldHover}`,
                        fontSize: 14,
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)",
                      }}
                    >
                      {generating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate Clue
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="grid place-items-center"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "rgba(0,212,217,.12)",
                          border: `1px solid ${C.cyan}55`,
                        }}
                      >
                        <ScrollText size={18} style={{ color: C.cyan }} />
                      </div>
                      <div>
                        <h2
                          className="font-bold"
                          style={{ fontSize: 15, color: C.heading }}
                        >
                          Generate Evidence
                        </h2>
                        <p style={{ fontSize: 11.5, color: C.secondary }}>
                          Create a document — letters, diaries, reports
                        </p>
                      </div>
                    </div>

                    <Field label="Genre">
                      <select
                        value={evidenceForm.genre}
                        onChange={(e) =>
                          setEvidenceForm({
                            ...evidenceForm,
                            genre: e.target.value,
                          })
                        }
                        className="w-full outline-none"
                        style={fieldStyle}
                      >
                        {GENRES.map((g) => (
                          <option key={g} style={optionStyle}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Setting">
                      <input
                        value={evidenceForm.setting}
                        onChange={(e) =>
                          setEvidenceForm({
                            ...evidenceForm,
                            setting: e.target.value,
                          })
                        }
                        placeholder="e.g. Luxury Hotel"
                        className="w-full outline-none"
                        style={fieldStyle}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Field label="Era">
                        <select
                          value={evidenceForm.era}
                          onChange={(e) =>
                            setEvidenceForm({
                              ...evidenceForm,
                              era: e.target.value,
                            })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {ERAS.map((e) => (
                            <option key={e} style={optionStyle}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Document Type">
                        <select
                          value={evidenceForm.evidenceType}
                          onChange={(e) =>
                            setEvidenceForm({
                              ...evidenceForm,
                              evidenceType: e.target.value,
                            })
                          }
                          className="w-full outline-none"
                          style={fieldStyle}
                        >
                          {EVIDENCE_TYPES.map((t) => (
                            <option key={t} style={optionStyle}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Extra Prompt (optional)">
                      <textarea
                        value={evidenceForm.prompt}
                        onChange={(e) =>
                          setEvidenceForm({
                            ...evidenceForm,
                            prompt: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="e.g. A warning letter from an anonymous sender"
                        className="w-full outline-none resize-none"
                        style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                      />
                    </Field>

                    <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={evidenceForm.includeImage}
                        onChange={(e) =>
                          setEvidenceForm({
                            ...evidenceForm,
                            includeImage: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#F6C55D]"
                      />
                      <span style={{ fontSize: 12, color: C.secondary }}>
                        Generate AI image
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateEvidence}
                      disabled={generating}
                      className="w-full flex items-center justify-center gap-2 rounded-[10px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        height: 50,
                        background: C.goldGradient,
                        color: C.mainBg,
                        border: `1px solid ${C.goldHover}`,
                        fontSize: 14,
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)",
                      }}
                    >
                      {generating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate Evidence
                        </>
                      )}
                    </button>
                  </>
                )}
              </section>

              {/* ===== RIGHT — LIBRARY ===== */}
              <section
                className="rounded-[12px] p-5 min-w-0"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid place-items-center"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "rgba(0,212,217,.12)",
                        border: `1px solid ${C.cyan}55`,
                      }}
                    >
                      {activeTab === "clues" ? (
                        <Search size={18} style={{ color: C.cyan }} />
                      ) : (
                        <ScrollText size={18} style={{ color: C.cyan }} />
                      )}
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{ fontSize: 15, color: C.heading }}
                      >
                        {activeTab === "clues"
                          ? "Clue Library"
                          : "Evidence Library"}
                      </h2>
                      <p style={{ fontSize: 11.5, color: C.secondary }}>
                        {activeTab === "clues"
                          ? `${clues.length} clue${clues.length === 1 ? "" : "s"}`
                          : `${evidence.length} document${
                              evidence.length === 1 ? "" : "s"
                            }`}
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-[260px]">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: C.gold }}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search…"
                      className="w-full outline-none"
                      style={{ ...fieldStyle, paddingLeft: 36, height: 40 }}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-[10px]"
                        style={{
                          background: "#0C1926",
                          border: `1px solid ${C.border}`,
                          height: 240,
                        }}
                      />
                    ))}
                  </div>
                ) : activeTab === "clues" ? (
                  filteredClues.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="No clues yet"
                      text="Fill in the form on the left and click Generate Clue to build your first one."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredClues.map((c) => (
                        <ClueCard
                          key={c.id}
                          clue={c}
                          onView={() =>
                            setPreviewItem({ kind: "clue", item: c })
                          }
                          onDelete={() => handleDelete("clues", c.id, c.title)}
                          deleting={deletingId === c.id}
                        />
                      ))}
                    </div>
                  )
                ) : filteredEvidence.length === 0 ? (
                  <EmptyState
                    icon={ScrollText}
                    title="No evidence yet"
                    text="Fill in the form on the left and click Generate Evidence to build your first document."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEvidence.map((e) => (
                      <EvidenceCard
                        key={e.id}
                        evidence={e}
                        onView={() =>
                          setPreviewItem({ kind: "evidence", item: e })
                        }
                        onDelete={() => handleDelete("evidence", e.id, e.title)}
                        deleting={deletingId === e.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* PREVIEW MODAL */}
      {previewItem && (
        <PreviewModal
          preview={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}

// ================================================================
// SHARED STYLES
// ================================================================
const fieldStyle = {
  height: 40,
  border: `1px solid #29414C`,
  background: "#000611",
  borderRadius: 8,
  color: "#F5F5F3",
  padding: "0 12px",
  fontSize: 12.5,
};

const optionStyle = {
  background: "#031520",
  color: "#F5F5F3",
};

// ================================================================
// FIELD WRAPPER
// ================================================================
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label
        className="block mb-1.5 text-[12px] font-semibold"
        style={{ color: "#F5F5F3" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ================================================================
// EMPTY STATE
// ================================================================
function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="text-center py-16">
      <div
        className="grid place-items-center mx-auto mb-4"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(246,197,93,.1)",
          border: `1px solid #F6C55D55`,
        }}
      >
        <Icon size={28} style={{ color: "#F6C55D" }} />
      </div>
      <h3
        className="font-['Playfair_Display',Georgia,serif] mb-2"
        style={{ fontSize: 20, color: "#F5F5F3" }}
      >
        {title}
      </h3>
      <p
        className="mx-auto max-w-[360px]"
        style={{ fontSize: 13, color: "#AAB3B9" }}
      >
        {text}
      </p>
    </div>
  );
}

// ================================================================
// CLUE CARD
// ================================================================
function ClueCard({ clue, onView, onDelete, deleting }) {
  const importanceColor =
    clue.importance === "Critical"
      ? "#ff8fa8"
      : clue.importance === "Major"
        ? "#F6C55D"
        : "#00D4D9";

  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col transition-all hover:-translate-y-[2px]"
      style={{ background: "#0C1926", border: `1px solid #29414C` }}
    >
      {clue.imageUrl && (
        <div
          className="relative"
          style={{
            aspectRatio: "16/10",
            background: "#000000",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <img
            src={getImageUrl(clue.imageUrl)}
            alt={clue.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <h3
            className="font-['Playfair_Display',Georgia,serif] font-bold truncate"
            style={{ fontSize: 15, color: "#F5F5F3" }}
            title={clue.title}
          >
            {clue.title}
          </h3>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 mb-2">
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9.5,
              background: "rgba(246,197,93,.15)",
              border: `1px solid #F6C55D55`,
              color: "#F6C55D",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {clue.type}
          </span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9.5,
              background: "transparent",
              border: `1px solid ${importanceColor}`,
              color: importanceColor,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {clue.importance}
          </span>
          {clue.isRedHerring && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                fontSize: 9.5,
                background: "rgba(255,95,126,.12)",
                border: "1px solid rgba(255,95,126,.4)",
                color: "#ff8fa8",
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
          className="leading-[1.5] mb-3 line-clamp-3"
          style={{ fontSize: 11.5, color: "#AAB3B9" }}
        >
          {clue.description}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 h-[34px] rounded-[8px] text-[12px] font-bold"
            style={{
              background: "#F6C55D",
              color: "#000C16",
              border: "1px solid #FFD36D",
            }}
          >
            <Eye size={13} />
            View
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="grid place-items-center w-[34px] h-[34px] rounded-[8px] disabled:opacity-40"
            style={{
              background: "#000611",
              border: "1px solid #29414C",
              color: "#ff8fa8",
            }}
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// EVIDENCE CARD
// ================================================================
function EvidenceCard({ evidence, onView, onDelete, deleting }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col transition-all hover:-translate-y-[2px]"
      style={{ background: "#0C1926", border: `1px solid #29414C` }}
    >
      {evidence.imageUrl ? (
        <div
          className="relative"
          style={{
            aspectRatio: "16/10",
            background: "#000000",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <img
            src={getImageUrl(evidence.imageUrl)}
            alt={evidence.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      ) : (
        <div
          className="grid place-items-center"
          style={{
            height: 140,
            background: "rgba(0,212,217,.06)",
            borderBottom: `1px solid #29414C`,
          }}
        >
          <FileText size={36} style={{ color: "#00D4D9", opacity: 0.5 }} />
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "1.4px",
            color: "#00D4D9",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {evidence.type}
        </div>
        <h3
          className="font-['Playfair_Display',Georgia,serif] font-bold truncate mb-2"
          style={{ fontSize: 15, color: "#F5F5F3" }}
          title={evidence.title}
        >
          {evidence.title}
        </h3>

        <p
          className="leading-[1.5] mb-3 line-clamp-3 whitespace-pre-line"
          style={{ fontSize: 11.5, color: "#AAB3B9" }}
        >
          {evidence.body}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 h-[34px] rounded-[8px] text-[12px] font-bold"
            style={{
              background: "#00D4D9",
              color: "#000C16",
              border: "1px solid #50F2F0",
            }}
          >
            <Eye size={13} />
            View
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="grid place-items-center w-[34px] h-[34px] rounded-[8px] disabled:opacity-40"
            style={{
              background: "#000611",
              border: "1px solid #29414C",
              color: "#ff8fa8",
            }}
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PREVIEW MODAL
// ================================================================
function PreviewModal({ preview, onClose }) {
  const { kind, item } = preview;
  const imageUrl = item.imageUrl ? getImageUrl(item.imageUrl) : null;

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
        className="relative w-full max-w-[820px] rounded-[20px] overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "#031520",
          border: "1px solid #29414C",
          boxShadow: "0 30px 100px rgba(0,0,0,.8)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid place-items-center w-9 h-9 rounded-full"
          style={{
            background: "rgba(0,12,22,.9)",
            border: "1px solid #29414C",
            color: "#AAB3B9",
          }}
        >
          <X size={16} />
        </button>

        <div className={imageUrl ? "grid md:grid-cols-[320px_1fr]" : ""}>
          {imageUrl && (
            <div
              className="relative"
              style={{
                background: "#000000",
                minHeight: 320,
                borderRight: "1px solid #29414C",
              }}
            >
              <img
                src={imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-2"
              style={{
                background:
                  kind === "clue"
                    ? "rgba(246,197,93,.12)"
                    : "rgba(0,212,217,.12)",
                border:
                  kind === "clue"
                    ? "1px solid #F6C55D55"
                    : "1px solid #00D4D955",
                fontSize: 11,
                color: kind === "clue" ? "#FFD36D" : "#00D4D9",
                fontWeight: 600,
              }}
            >
              {kind === "clue" ? item.type : item.type}
            </div>

            <h2
              className="font-['Playfair_Display',Georgia,serif] font-bold mb-3"
              style={{ fontSize: 26, color: "#F5F5F3", lineHeight: 1.2 }}
            >
              {item.title}
            </h2>

            {kind === "clue" ? (
              <div className="space-y-3">
                {item.description && (
                  <Row label="Description" value={item.description} />
                )}
                {item.discoveryLocation && (
                  <Row label="Found at" value={item.discoveryLocation} />
                )}
                {item.supportsDeduction && (
                  <Row label="Supports" value={item.supportsDeduction} />
                )}
                {item.hint && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-[8px]"
                    style={{
                      background: "rgba(246,197,93,.08)",
                      border: "1px solid #F6C55D45",
                    }}
                  >
                    <Lightbulb
                      size={14}
                      style={{ color: "#F6C55D", marginTop: 2, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "#FFD36D",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.hint}
                    </span>
                  </div>
                )}
                {item.relatedCharacters?.length > 0 && (
                  <Row
                    label="Related characters"
                    value={item.relatedCharacters.join(", ")}
                  />
                )}
              </div>
            ) : (
              <div
                className="whitespace-pre-line leading-[1.75]"
                style={{
                  fontSize: 13.5,
                  color: "#F5F5F3",
                  fontFamily: "'Courier New', monospace",
                  padding: 16,
                  background: "#000611",
                  border: "1px dashed #29414C",
                  borderRadius: 8,
                }}
              >
                {item.body}
              </div>
            )}

            {imageUrl && (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage(imageUrl, `${item.title}.png`)}
                  className="flex items-center gap-2 h-[42px] px-4 rounded-[10px] text-[13px] font-bold"
                  style={{
                    background: kind === "clue" ? "#F6C55D" : "#00D4D9",
                    color: "#000C16",
                    border:
                      kind === "clue"
                        ? "1px solid #FFD36D"
                        : "1px solid #50F2F0",
                  }}
                >
                  <ImageIcon size={14} />
                  Download Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "1.4px",
          color: "#707F88",
          fontWeight: 600,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: 13, color: "#F5F5F3", lineHeight: 1.55 }}>
        {value}
      </p>
    </div>
  );
}
