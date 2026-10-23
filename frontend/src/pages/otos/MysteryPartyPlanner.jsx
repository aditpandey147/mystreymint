// frontend/src/pages/MysteryPartyPlanner.jsx
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  PartyPopper,
  BookOpen,
  Check,
  Copy,
  Download,
  Users,
  Clock,
  Calendar,
  MapPin,
  Wine,
  Utensils,
  Music,
  Sparkle,
  Lightbulb,
  Megaphone,
  ListChecks,
  Coffee,
  Award,
  AlertTriangle,
  ChevronRight,
  Gift,
  Wand2,
  ClipboardList,
  Heart,
  ChefHat,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import partyPlannerBg from "../../assets/images/party-planner-bg.png";

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
  rose: "#ff8fa8",
  violet: "#A78BFA",
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
// OPTIONS
// ================================================================
const VENUES = [
  "Home",
  "Restaurant",
  "Escape Room",
  "Hotel Suite",
  "Garden / Patio",
  "Country House",
  "Rented Venue",
];
const PARTY_STYLES = [
  "Classic 1920s",
  "Modern Chic",
  "Victorian Gothic",
  "Tropical",
  "Sci-Fi Futuristic",
  "Medieval Banquet",
  "Masquerade",
  "Film Noir",
];
const FOOD_PREFS = [
  "No restrictions",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Nut-free",
  "Mixed dietary needs",
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
export default function MysteryPartyPlanner() {
  const [mysteries, setMysteries] = useState([]);
  const [loadingMysteries, setLoadingMysteries] = useState(true);

  const [selectedMystery, setSelectedMystery] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [activeTab, setActiveTab] = useState("invitation");

  const [form, setForm] = useState({
    partyDate: "",
    partyTime: "7:00 PM",
    guestCount: 6,
    venue: "Home",
    partyStyle: "Classic 1920s",
    foodPreferences: "No restrictions",
    includeCostumes: true,
    prompt: "",
  });

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
  // GENERATE
  // ================================================================
  const handleGenerate = async () => {
    if (!selectedMystery) {
      toast.error("Select a mystery first");
      return;
    }
    if (generating) return;

    try {
      setGenerating(true);
      setPlanData(null);
      toast.loading("Planning your party… takes 45-90 seconds.", {
        id: "gen-plan",
      });

      const res = await api.post(
        "/party-planner/generate",
        {
          mysteryId: selectedMystery._id,
          ...form,
        },
        { timeout: 300000 },
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Generation failed");
      }

      toast.success("Party plan ready!", { id: "gen-plan" });
      setPlanData(res.data.data);
      setActiveTab("invitation");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to generate",
        { id: "gen-plan" },
      );
    } finally {
      setGenerating(false);
    }
  };

  // ================================================================
  // DOWNLOAD AS TXT
  // ================================================================
  const downloadAsTxt = () => {
    if (!planData) return;
    const p = planData.plan;

    let text = `# MURDER MYSTERY PARTY PLAN\n\n`;
    text += `## ${planData.mysteryTitle}\n\n`;
    text += `**Theme:** ${p.partyTheme}\n`;
    text += `**Date:** ${planData.partyDate || "TBD"} at ${planData.partyTime}\n`;
    text += `**Guests:** ${planData.guestCount}\n`;
    text += `**Venue:** ${planData.venue}\n`;
    text += `**Duration:** ${p.partyDurationMinutes} minutes\n\n`;

    text += `\n${"=".repeat(60)}\n## INVITATION\n${"=".repeat(60)}\n\n`;
    text += `**${p.invitation.headline}**\n\n${p.invitation.body}\n\n`;
    text += `Dress code: ${p.invitation.dressCode}\n`;
    text += `RSVP: ${p.invitation.rsvpLine}\n`;
    if (p.invitation.whatToBring?.length) {
      text += `Bring:\n${p.invitation.whatToBring.map((w) => `- ${w}`).join("\n")}\n`;
    }

    text += `\n${"=".repeat(60)}\n## PREPARATION TIMELINE\n${"=".repeat(60)}\n\n`;
    p.preparationTimeline?.forEach((prep) => {
      text += `### ${prep.when}\n`;
      prep.tasks?.forEach((t) => (text += `- ${t}\n`));
      text += "\n";
    });

    text += `\n${"=".repeat(60)}\n## CHARACTER ASSIGNMENTS\n${"=".repeat(60)}\n\n`;
    p.characterAssignments?.forEach((ca, i) => {
      text += `${i + 1}. ${ca.characterName} (${ca.role})\n`;
      text += `   ${ca.guestSlot} — ${ca.whyThisGuest}\n\n`;
    });

    text += `\n${"=".repeat(60)}\n## PARTY SCHEDULE\n${"=".repeat(60)}\n\n`;
    p.partySchedule?.forEach((s) => {
      text += `${s.time} (${s.duration}) — ${s.activity}\n   GM: ${s.hostNotes}\n\n`;
    });

    text += `\n${"=".repeat(60)}\n## FOOD & DRINK\n${"=".repeat(60)}\n\n`;
    if (p.foodAndDrink?.cocktailIdeas?.length) {
      text += `Cocktails:\n${p.foodAndDrink.cocktailIdeas.map((c) => `- ${c}`).join("\n")}\n\n`;
    }
    if (p.foodAndDrink?.appetizers?.length) {
      text += `Appetizers:\n${p.foodAndDrink.appetizers.map((a) => `- ${a}`).join("\n")}\n\n`;
    }
    if (p.foodAndDrink?.mains?.length) {
      text += `Mains:\n${p.foodAndDrink.mains.map((m) => `- ${m}`).join("\n")}\n\n`;
    }
    if (p.foodAndDrink?.dessert?.length) {
      text += `Dessert:\n${p.foodAndDrink.dessert.map((d) => `- ${d}`).join("\n")}\n\n`;
    }

    text += `\n${"=".repeat(60)}\n## DECORATIONS\n${"=".repeat(60)}\n\n`;
    if (p.decorations?.colorPalette?.length) {
      text += `Colors: ${p.decorations.colorPalette.join(", ")}\n\n`;
    }
    if (p.decorations?.propIdeas?.length) {
      text += `Props:\n${p.decorations.propIdeas.map((p2) => `- ${p2}`).join("\n")}\n\n`;
    }
    if (p.decorations?.soundtrackIdeas?.length) {
      text += `Music:\n${p.decorations.soundtrackIdeas.map((s) => `- ${s}`).join("\n")}\n\n`;
    }

    text += `\n${"=".repeat(60)}\n## GAME MASTER RUN SHEET\n${"=".repeat(60)}\n\n`;
    p.gameMasterRunSheet?.forEach((g) => {
      text += `### ${g.phase} — ${g.time}\n`;
      text += `${g.whatToDo}\n`;
      text += `Say: "${g.whatToSay}"\n\n`;
    });

    text += `\n${"=".repeat(60)}\n## PARTY FAVORS\n${"=".repeat(60)}\n\n`;
    p.partyFavors?.forEach((f) => (text += `- ${f}\n`));

    if (p.contingencyTips?.length) {
      text += `\n${"=".repeat(60)}\n## CONTINGENCY TIPS\n${"=".repeat(60)}\n\n`;
      p.contingencyTips.forEach((c) => (text += `- ${c}\n`));
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${planData.mysteryTitle.replace(/\s+/g, "_")}_Party_Plan.txt`;
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
                  backgroundImage: `url(${partyPlannerBg})`,
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
                  Mystery Party Planner
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
                  Plan the{" "}
                  <em className="not-italic" style={{ color: C.gold }}>
                    Perfect Party
                  </em>
                </h1>

                <p
                  className="leading-[26px] max-w-[640px]"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    color: C.heading,
                  }}
                >
                  Turn any mystery into an unforgettable night — invitations,
                  character assignments, menus, décor, icebreakers, and a full
                  Game Master run sheet, all planned by AI.
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
                    Only completed mysteries are available
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

            {/* ========== STEP 2 — PARTY DETAILS ========== */}
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
                  2
                </div>
                <div>
                  <h2
                    className="font-bold"
                    style={{ fontSize: 16, color: C.heading }}
                  >
                    Party Details
                  </h2>
                  <p style={{ fontSize: 12.5, color: C.secondary }}>
                    Tell us about your party so the AI can plan it right
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Party Date" icon={Calendar}>
                  <input
                    type="date"
                    value={form.partyDate}
                    onChange={(e) =>
                      setForm({ ...form, partyDate: e.target.value })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  />
                </Field>

                <Field label="Start Time" icon={Clock}>
                  <input
                    type="text"
                    value={form.partyTime}
                    onChange={(e) =>
                      setForm({ ...form, partyTime: e.target.value })
                    }
                    placeholder="e.g. 7:00 PM"
                    className="w-full outline-none"
                    style={fieldStyle}
                  />
                </Field>

                <Field label="Number of Guests" icon={Users}>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={form.guestCount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        guestCount: Number(e.target.value) || 6,
                      })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  />
                </Field>

                <Field label="Venue" icon={MapPin}>
                  <select
                    value={form.venue}
                    onChange={(e) =>
                      setForm({ ...form, venue: e.target.value })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {VENUES.map((v) => (
                      <option key={v} style={optionStyle}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Party Style" icon={Sparkle}>
                  <select
                    value={form.partyStyle}
                    onChange={(e) =>
                      setForm({ ...form, partyStyle: e.target.value })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {PARTY_STYLES.map((s) => (
                      <option key={s} style={optionStyle}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Food Preferences" icon={ChefHat}>
                  <select
                    value={form.foodPreferences}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        foodPreferences: e.target.value,
                      })
                    }
                    className="w-full outline-none"
                    style={fieldStyle}
                  >
                    {FOOD_PREFS.map((f) => (
                      <option key={f} style={optionStyle}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <label className="flex items-center gap-2 mt-4 mb-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.includeCostumes}
                  onChange={(e) =>
                    setForm({ ...form, includeCostumes: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F6C55D]"
                />
                <span style={{ fontSize: 12.5, color: C.secondary }}>
                  Include costume suggestions in invitations
                </span>
              </label>

              <Field label="Extra Notes (optional)">
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  rows={3}
                  placeholder="e.g. Surprise birthday party, must include a toast at 9 PM"
                  className="w-full outline-none resize-none"
                  style={{ ...fieldStyle, height: 80, paddingTop: 10 }}
                />
              </Field>
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
                      Generate Party Plan
                    </h2>
                    <p style={{ fontSize: 12.5, color: C.secondary }}>
                      Full plan in 45-90 seconds — invitations, food, GM sheet
                      and more
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !selectedMystery}
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
                      Planning…
                    </>
                  ) : (
                    <>
                      <PartyPopper size={17} />
                      Generate Party Plan
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* ========== RESULTS ========== */}
            {planData && (
              <PlanResults
                data={planData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDownload={downloadAsTxt}
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
function PlanResults({ data, activeTab, setActiveTab, onDownload }) {
  const p = data.plan;

  const TABS = [
    { id: "invitation", label: "Invitation", icon: Megaphone },
    { id: "prep", label: "Preparation", icon: ListChecks },
    { id: "characters", label: "Characters", icon: Users },
    { id: "schedule", label: "Schedule", icon: Clock },
    { id: "food", label: "Food & Drink", icon: Utensils },
    { id: "decor", label: "Décor", icon: Sparkle },
    { id: "icebreakers", label: "Icebreakers", icon: Coffee },
    { id: "gm", label: "GM Run Sheet", icon: ClipboardList },
    { id: "extras", label: "Favors & Tips", icon: Gift },
  ];

  return (
    <div className="space-y-4">
      {/* Header card */}
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
            {data.mysteryCover ? (
              <img
                src={getImageUrl(data.mysteryCover)}
                alt={data.mysteryTitle}
                className="rounded-[10px] object-cover"
                style={{
                  width: 56,
                  height: 56,
                  border: `1px solid ${C.gold}55`,
                }}
              />
            ) : (
              <div
                className="grid place-items-center rounded-[10px] shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  background: "rgba(246,197,93,.15)",
                  border: `1px solid ${C.gold}55`,
                }}
              >
                <PartyPopper size={24} style={{ color: C.gold }} />
              </div>
            )}
            <div>
              <div
                className="font-['Playfair_Display',Georgia,serif] font-bold mb-0.5"
                style={{ fontSize: 20, color: C.heading }}
              >
                {data.mysteryTitle}
              </div>
              <div style={{ fontSize: 12, color: C.secondary }}>
                {p.partyDurationMinutes} min · {data.guestCount} guests ·{" "}
                {data.venue} · {data.partyStyle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-2 h-[40px] px-4 rounded-[9px] text-[12.5px] font-bold transition-all hover:-translate-y-[1px]"
            style={{
              background: "transparent",
              color: C.gold,
              border: `1px solid ${C.gold}`,
            }}
          >
            <Download size={14} />
            Download Plan (.txt)
          </button>
        </div>

        {/* Party theme + date */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetaCard
            icon={Sparkle}
            label="Theme"
            value={p.partyTheme}
            color={C.gold}
          />
          <MetaCard
            icon={Calendar}
            label="Date"
            value={data.partyDate || "TBD"}
            color={C.cyan}
          />
          <MetaCard
            icon={Clock}
            label="Start Time"
            value={data.partyTime}
            color={C.violet}
          />
          <MetaCard
            icon={Users}
            label="Guests"
            value={String(data.guestCount)}
            color={C.rose}
          />
        </div>
      </section>

      {/* Tabs */}
      <section
        className="rounded-[12px] p-2 overflow-x-auto"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 h-[42px] px-[14px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all shrink-0"
                style={{
                  background: isActive ? C.gold : "transparent",
                  color: isActive ? C.mainBg : C.secondary,
                  border: isActive
                    ? `1px solid ${C.goldHover}`
                    : `1px solid ${C.border}`,
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <section
        className="rounded-[12px] p-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {activeTab === "invitation" && <InvitationTab data={p.invitation} />}
        {activeTab === "prep" && <PrepTab timeline={p.preparationTimeline} />}
        {activeTab === "characters" && (
          <CharactersTab assignments={p.characterAssignments} />
        )}
        {activeTab === "schedule" && <ScheduleTab items={p.partySchedule} />}
        {activeTab === "food" && <FoodTab data={p.foodAndDrink} />}
        {activeTab === "decor" && <DecorTab data={p.decorations} />}
        {activeTab === "icebreakers" && (
          <IcebreakersTab items={p.icebreakers} />
        )}
        {activeTab === "gm" && <GMRunSheetTab items={p.gameMasterRunSheet} />}
        {activeTab === "extras" && (
          <ExtrasTab favors={p.partyFavors} tips={p.contingencyTips} />
        )}
      </section>
    </div>
  );
}

// ================================================================
// TAB COMPONENTS
// ================================================================
function InvitationTab({ data }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Megaphone}
        title="The Invitation"
        subtitle="Copy-paste ready for email or print"
      />

      <div
        className="rounded-[12px] p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(246,197,93,.08) 0%, rgba(183,123,50,.05) 100%)",
          border: `1px solid ${C.gold}55`,
        }}
      >
        <div
          className="text-center mb-4 font-['Playfair_Display',Georgia,serif]"
          style={{
            fontSize: 24,
            color: C.goldHover,
            lineHeight: 1.3,
          }}
        >
          {data.headline}
        </div>
        <div
          className="whitespace-pre-line mb-4 text-center"
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: C.heading,
          }}
        >
          {data.body}
        </div>
        {data.dressCode && (
          <div
            className="text-center italic mb-3"
            style={{ fontSize: 13, color: C.secondary }}
          >
            🎩 {data.dressCode}
          </div>
        )}
        {data.rsvpLine && (
          <div
            className="text-center font-semibold"
            style={{ fontSize: 13, color: C.gold }}
          >
            {data.rsvpLine}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          copyToClipboard(
            `${data.headline}\n\n${data.body}\n\nDress code: ${data.dressCode}\n${data.rsvpLine}`,
            "Invitation copied",
          )
        }
        className="flex items-center gap-2 h-[40px] px-4 rounded-[9px] text-[12.5px] font-bold transition-all"
        style={{
          background: "transparent",
          color: C.gold,
          border: `1px solid ${C.gold}`,
        }}
      >
        <Copy size={14} />
        Copy Invitation Text
      </button>

      {data.whatToBring?.length > 0 && (
        <div
          className="rounded-[10px] p-4"
          style={{
            background: C.input,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.cyan,
            }}
          >
            <Gift size={12} />
            What to Bring
          </div>
          <ul className="space-y-1">
            {data.whatToBring.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2"
                style={{ fontSize: 13, color: C.heading }}
              >
                <ChevronRight
                  size={13}
                  style={{ color: C.cyan, marginTop: 3, flexShrink: 0 }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PrepTab({ timeline }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={ListChecks}
        title="Preparation Timeline"
        subtitle="Do these in order leading up to the party"
      />
      <div className="space-y-3">
        {timeline?.map((item, i) => (
          <div
            key={i}
            className="rounded-[10px] p-4"
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.gold}`,
            }}
          >
            <div
              className="font-bold mb-2 flex items-center gap-2"
              style={{ fontSize: 14, color: C.gold }}
            >
              <Clock size={14} />
              {item.when}
            </div>
            <ul className="space-y-1.5">
              {item.tasks?.map((task, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2"
                  style={{ fontSize: 13, color: C.heading }}
                >
                  <Check
                    size={13}
                    style={{
                      color: C.cyan,
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                  />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharactersTab({ assignments }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Users}
        title="Character Assignments"
        subtitle="Match each guest to their role"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {assignments?.map((ca, i) => (
          <div
            key={i}
            className="rounded-[10px] p-4"
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
            }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div
                className="grid place-items-center shrink-0 rounded-full font-bold"
                style={{
                  width: 34,
                  height: 34,
                  background: "rgba(246,197,93,.15)",
                  border: `1px solid ${C.gold}55`,
                  color: C.gold,
                  fontSize: 14,
                }}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="font-bold"
                  style={{ fontSize: 14, color: C.heading }}
                >
                  {ca.characterName}
                </div>
                <div style={{ fontSize: 11, color: C.gold }}>{ca.role}</div>
              </div>
            </div>
            <div
              className="mb-2 px-2 py-1 rounded-[6px] inline-block"
              style={{
                background: "rgba(0,212,217,.1)",
                border: `1px solid ${C.cyan}45`,
                fontSize: 10.5,
                color: C.cyan,
                fontWeight: 600,
              }}
            >
              {ca.guestSlot}
            </div>
            <p
              className="mb-1"
              style={{ fontSize: 12, color: C.secondary, lineHeight: 1.5 }}
            >
              {ca.whyThisGuest}
            </p>
            {ca.recommendedPlayerType && (
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  fontStyle: "italic",
                }}
              >
                Ideal for: {ca.recommendedPlayerType}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleTab({ items }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Clock}
        title="Party Schedule"
        subtitle="Time-blocked agenda for the whole night"
      />
      <div className="space-y-3">
        {items?.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-[10px] p-4"
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="shrink-0 font-['Playfair_Display',Georgia,serif] font-bold"
              style={{
                minWidth: 90,
                fontSize: 15,
                color: C.gold,
              }}
            >
              {item.time}
              <div
                style={{
                  fontSize: 10,
                  color: C.muted,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                {item.duration}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-bold mb-1"
                style={{ fontSize: 14, color: C.heading }}
              >
                {item.activity}
              </div>
              <div
                className="italic"
                style={{
                  fontSize: 11.5,
                  color: C.secondary,
                  lineHeight: 1.5,
                }}
              >
                🎯 {item.hostNotes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodTab({ data }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Utensils}
        title="Food & Drink"
        subtitle="Themed menu for the night"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.cocktailIdeas?.length > 0 && (
          <FoodCard
            icon={Wine}
            title="Cocktails"
            items={data.cocktailIdeas}
            color={C.rose}
          />
        )}
        {data.appetizers?.length > 0 && (
          <FoodCard
            icon={Utensils}
            title="Appetizers"
            items={data.appetizers}
            color={C.cyan}
          />
        )}
        {data.mains?.length > 0 && (
          <FoodCard
            icon={ChefHat}
            title="Mains"
            items={data.mains}
            color={C.gold}
          />
        )}
        {data.dessert?.length > 0 && (
          <FoodCard
            icon={Heart}
            title="Dessert"
            items={data.dessert}
            color={C.violet}
          />
        )}
      </div>
      {data.dietaryNotes && (
        <div
          className="rounded-[10px] p-3 flex items-start gap-2"
          style={{
            background: "rgba(255,143,168,.08)",
            border: `1px solid ${C.rose}45`,
          }}
        >
          <AlertTriangle
            size={14}
            style={{ color: C.rose, marginTop: 2, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12.5, color: C.rose, lineHeight: 1.5 }}>
            {data.dietaryNotes}
          </span>
        </div>
      )}
    </div>
  );
}

function FoodCard({ icon: Icon, title, items, color }) {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{
        background: C.input,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="font-bold mb-2 flex items-center gap-2"
        style={{ fontSize: 13, color }}
      >
        <Icon size={14} />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2"
            style={{ fontSize: 12.5, color: C.heading, lineHeight: 1.5 }}
          >
            <Sparkle size={11} style={{ color, marginTop: 3, flexShrink: 0 }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecorTab({ data }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Sparkle}
        title="Décor & Atmosphere"
        subtitle="Set the scene"
      />

      {data.colorPalette?.length > 0 && (
        <div>
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.gold,
            }}
          >
            <Sparkle size={12} />
            Color Palette
          </div>
          <div className="flex flex-wrap gap-2">
            {data.colorPalette.map((c, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-[8px]"
                style={{
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  fontSize: 12.5,
                  color: C.heading,
                }}
              >
                🎨 {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.propIdeas?.length > 0 && (
        <div>
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.cyan,
            }}
          >
            <Gift size={12} />
            Prop Ideas
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.propIdeas.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-[8px]"
                style={{
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  fontSize: 12.5,
                  color: C.heading,
                }}
              >
                <ChevronRight
                  size={13}
                  style={{ color: C.cyan, marginTop: 2, flexShrink: 0 }}
                />
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.soundtrackIdeas?.length > 0 && (
        <div>
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.violet,
            }}
          >
            <Music size={12} />
            Soundtrack
          </div>
          <ul className="space-y-1.5">
            {data.soundtrackIdeas.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2"
                style={{ fontSize: 13, color: C.heading }}
              >
                <Music
                  size={12}
                  style={{ color: C.violet, marginTop: 3, flexShrink: 0 }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.lightingNotes && (
        <div
          className="rounded-[10px] p-3"
          style={{
            background: "rgba(167,139,250,.08)",
            border: `1px solid ${C.violet}45`,
          }}
        >
          <div
            className="font-bold mb-1 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.violet,
            }}
          >
            <Lightbulb size={12} />
            Lighting
          </div>
          <p style={{ fontSize: 12.5, color: C.heading, lineHeight: 1.55 }}>
            {data.lightingNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function IcebreakersTab({ items }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Coffee}
        title="Icebreakers"
        subtitle="Warm up the room before the mystery begins"
      />
      <div className="space-y-3">
        {items?.map((ib, i) => (
          <div
            key={i}
            className="rounded-[10px] p-4"
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.cyan}`,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <div
                className="font-bold"
                style={{ fontSize: 14, color: C.heading }}
              >
                {ib.name}
              </div>
              <div className="flex gap-1.5">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: 10,
                    background: "rgba(0,212,217,.15)",
                    border: `1px solid ${C.cyan}55`,
                    color: C.cyan,
                    fontWeight: 600,
                  }}
                >
                  {ib.duration}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: 10,
                    background: "rgba(246,197,93,.15)",
                    border: `1px solid ${C.gold}55`,
                    color: C.gold,
                    fontWeight: 600,
                  }}
                >
                  {ib.when}
                </span>
              </div>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: C.secondary,
                lineHeight: 1.6,
              }}
            >
              {ib.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GMRunSheetTab({ items }) {
  const phaseColors = {
    Setup: C.violet,
    Arrival: C.cyan,
    Story: C.gold,
    Investigation: "#7DD3FC",
    Accusation: C.rose,
    Reveal: "#86EFAC",
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={ClipboardList}
        title="Game Master Run Sheet"
        subtitle="Step-by-step cue card for the host"
      />
      <div className="space-y-3">
        {items?.map((item, i) => {
          const color = phaseColors[item.phase] || C.gold;
          return (
            <div
              key={i}
              className="rounded-[10px] p-4"
              style={{
                background: C.input,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="px-2 py-0.5 rounded-full font-bold"
                  style={{
                    fontSize: 10,
                    background: `${color}20`,
                    border: `1px solid ${color}55`,
                    color,
                    textTransform: "uppercase",
                    letterSpacing: ".8px",
                  }}
                >
                  {item.phase}
                </span>
                <span
                  className="font-['Playfair_Display',Georgia,serif] font-bold"
                  style={{ fontSize: 13, color: C.gold }}
                >
                  {item.time}
                </span>
              </div>
              <p
                className="mb-2"
                style={{
                  fontSize: 13,
                  color: C.heading,
                  lineHeight: 1.6,
                }}
              >
                {item.whatToDo}
              </p>
              {item.whatToSay && (
                <div
                  className="rounded-[6px] p-2.5"
                  style={{
                    background: "rgba(246,197,93,.06)",
                    border: `1px dashed ${C.gold}55`,
                    fontSize: 12.5,
                    color: C.goldHover,
                    fontStyle: "italic",
                    lineHeight: 1.55,
                  }}
                >
                  💬 "Say: {item.whatToSay}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExtrasTab({ favors, tips }) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Gift}
        title="Favors & Contingency"
        subtitle="The finishing touches — and backup plans"
      />

      {favors?.length > 0 && (
        <div>
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.gold,
            }}
          >
            <Gift size={12} />
            Party Favors
          </div>
          <ul className="space-y-1.5">
            {favors.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 p-2 rounded-[6px]"
                style={{
                  background: "rgba(246,197,93,.06)",
                  border: `1px solid ${C.gold}30`,
                  fontSize: 13,
                  color: C.heading,
                }}
              >
                <Award
                  size={13}
                  style={{ color: C.gold, marginTop: 3, flexShrink: 0 }}
                />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tips?.length > 0 && (
        <div>
          <div
            className="font-bold mb-2 flex items-center gap-2"
            style={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              color: C.rose,
            }}
          >
            <AlertTriangle size={12} />
            Contingency Tips
          </div>
          <ul className="space-y-1.5">
            {tips.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-[8px]"
                style={{
                  background: "rgba(255,143,168,.06)",
                  border: `1px solid ${C.rose}30`,
                  fontSize: 12.5,
                  color: C.heading,
                  lineHeight: 1.5,
                }}
              >
                <Lightbulb
                  size={12}
                  style={{ color: C.rose, marginTop: 3, flexShrink: 0 }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ================================================================
// HELPERS
// ================================================================
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="grid place-items-center shrink-0 rounded-[10px]"
        style={{
          width: 38,
          height: 38,
          background: "rgba(246,197,93,.12)",
          border: `1px solid ${C.gold}55`,
        }}
      >
        <Icon size={18} style={{ color: C.gold }} />
      </div>
      <div>
        <div
          className="font-['Playfair_Display',Georgia,serif] font-bold"
          style={{ fontSize: 20, color: C.heading, lineHeight: 1.2 }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-[10px] p-3"
      style={{
        background: C.input,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="flex items-center gap-1.5 mb-1"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          color,
          fontWeight: 600,
        }}
      >
        <Icon size={11} />
        {label}
      </div>
      <div
        className="font-bold"
        style={{ fontSize: 13, color: C.heading, lineHeight: 1.35 }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label
        className="block mb-1.5 text-[12px] font-semibold flex items-center gap-1.5"
        style={{ color: C.heading }}
      >
        {Icon && <Icon size={12} style={{ color: C.gold }} />}
        {label}
      </label>
      {children}
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
