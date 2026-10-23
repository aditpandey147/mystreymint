// frontend/src/pages/Subscription.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Crown, CheckCircle, Calendar, Package, Sparkles, Zap,
  TrendingUp, Headphones, ArrowRight, Clock, XCircle,
  RefreshCw, Tag, Hash, CalendarDays, Info, Layers,
  BadgeCheck, Gift, Mic, Infinity as InfinityIcon, Flame,
  Palette, Boxes, BarChart3, Building2,
} from "lucide-react";

// ================================================================
// THEME (MysteryMint AI — gold + deep navy)
// ================================================================
const THEME = {
  bg: "#061b28",              // deep navy-teal scene background
  panel: "#0a2233",           // card/panel background
  panelDark: "#08192a",       // darker panel (hero)
  border: "#1c3a52",          // subtle navy border
  borderStrong: "rgba(234,193,118,.35)", // gold-tinted border
  text: "#f4f0e8",            // warm off-white (body)
  textMuted: "#a8b4c2",       // muted slate
  textDim: "#7d8fa8",         // dimmer slate
  gold: "#eac176",            // primary gold
  goldBright: "#ffcf67",      // bright gold (links)
  goldSoft: "#ffe1a4",        // soft gold (icons)
  goldDeep: "#d99c3e",        // deep gold (gradient end)
  goldDim: "rgba(234,193,118,.15)", // gold tint backgrounds
  goldBorder: "rgba(234,193,118,.35)",
};

// ================================================================
// PLAN META (unchanged logic, gold-tinted colors)
// ================================================================
const PLAN_META = {
  1:  { Icon: Gift,         color: "#94a3b8", label: "Free" },
  2:  { Icon: Mic,          color: "#6ddcff", label: "Podcast AI" },
  3:  { Icon: Zap,          color: "#eac176", label: "FE + TURBO" },
  4:  { Icon: InfinityIcon, color: "#c0c0c0", label: "Unlimited Silver" },
  5:  { Icon: Crown,        color: "#ffcf67", label: "Unlimited Gold" },
  6:  { Icon: Sparkles,     color: "#c9b5ff", label: "Podcast Creator Pro" },
  7:  { Icon: Flame,        color: "#ff8fa8", label: "Viral Shorts AI" },
  8:  { Icon: TrendingUp,   color: "#7de3b8", label: "Podcast Growth Studio" },
  9:  { Icon: Palette,      color: "#f4a6c4", label: "Branding Suite" },
  10: { Icon: Package,      color: "#94a3b8", label: "DFY Silver" },
  11: { Icon: Boxes,        color: "#ffcf67", label: "DFY Gold" },
  12: { Icon: BarChart3,    color: "#7de3e3", label: "AI Ranker" },
  13: { Icon: Building2,    color: "#b3b8ff", label: "Agency" },
  14: { Icon: Gift,         color: "#f4a6c4", label: "Reseller" },
};

const getPlanMeta = (planId) => {
  const id = Array.isArray(planId) ? Math.max(...planId) : planId;
  return PLAN_META[id] || { Icon: Package, color: "#94a3b8", label: "Unknown" };
};

const PlanIcon = ({ planId, size = 14, strokeWidth = 2 }) => {
  const { Icon, color } = getPlanMeta(planId);
  return <Icon size={size} strokeWidth={strokeWidth} color={color} />;
};

// ================================================================
// PAGE
// ================================================================
const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.get("/subscription/my-subscription");
      if (response.data?.success) {
        setSubscription(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getPlanDisplayName = (plan) => {
    return plan?.name || `Plan ${plan?.planId || 1}`;
  };

  // ================================================================
  // Color per planId (gold-tinted theme)
  // ================================================================
  const getPlanColor = (planId) => {
    const id = Array.isArray(planId) ? Math.max(...planId) : planId;
    const colors = {
      1:  { bg: "rgba(148,163,184,.12)", border: "rgba(148,163,184,.35)" },
      2:  { bg: "rgba(109,220,255,.14)", border: "rgba(109,220,255,.38)" },
      3:  { bg: "rgba(234,193,118,.15)", border: "rgba(234,193,118,.4)" },
      4:  { bg: "rgba(192,192,192,.14)", border: "rgba(192,192,192,.4)" },
      5:  { bg: "rgba(255,207,103,.16)", border: "rgba(255,207,103,.45)" },
      6:  { bg: "rgba(201,181,255,.15)", border: "rgba(201,181,255,.4)" },
      7:  { bg: "rgba(255,143,168,.15)", border: "rgba(255,143,168,.4)" },
      8:  { bg: "rgba(125,227,184,.15)", border: "rgba(125,227,184,.4)" },
      9:  { bg: "rgba(244,166,196,.15)", border: "rgba(244,166,196,.4)" },
      10: { bg: "rgba(148,163,184,.15)", border: "rgba(148,163,184,.4)" },
      11: { bg: "rgba(255,207,103,.16)", border: "rgba(255,207,103,.45)" },
      12: { bg: "rgba(125,227,227,.15)", border: "rgba(125,227,227,.4)" },
      13: { bg: "rgba(179,184,255,.15)", border: "rgba(179,184,255,.4)" },
      14: { bg: "rgba(244,166,196,.15)", border: "rgba(244,166,196,.4)" },
    };
    return colors[id] || colors[1];
  };

  // ================================================================
  // Status colors (theme-aligned)
  // ================================================================
  const getStatusColor = (status) => {
    const colors = {
      active:    { bg: "rgba(125,227,184,.15)", border: "rgba(125,227,184,.35)", fg: "#7de3b8" },
      cancelled: { bg: "rgba(255,143,168,.15)", border: "rgba(255,143,168,.35)", fg: "#ff8fa8" },
      refunded:  { bg: "rgba(255,207,103,.15)", border: "rgba(255,207,103,.35)", fg: "#ffcf67" },
      pending:   { bg: "rgba(109,220,255,.15)", border: "rgba(109,220,255,.35)", fg: "#6ddcff" },
    };
    return colors[status] || colors.active;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active:    <CheckCircle size={12} style={{ color: "#7de3b8" }} />,
      cancelled: <XCircle size={12} style={{ color: "#ff8fa8" }} />,
      refunded:  <RefreshCw size={12} style={{ color: "#ffcf67" }} />,
      pending:   <Clock size={12} style={{ color: "#6ddcff" }} />,
    };
    return icons[status] || icons.active;
  };

  const getStatusMessage = (status) => {
    const messages = {
      active:    "This plan is currently providing access to your account.",
      cancelled: "This plan has been cancelled and is no longer active.",
      refunded:  "This plan has been refunded.",
      pending:   "This plan is pending activation.",
    };
    return messages[status] || messages.active;
  };

  const totalSubscriptions = subscription?.allPlans?.length || 0;
  const activeSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "active").length || 0;
  const cancelledSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "cancelled").length || 0;
  const refundedSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "refunded").length || 0;

  // ================================================================
  // LOADING
  // ================================================================
  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: THEME.bg }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div
                  className="absolute inset-0 border-4 rounded-full"
                  style={{ borderColor: "rgba(234,193,118,.2)" }}
                ></div>
                <div
                  className="absolute inset-0 border-4 rounded-full animate-spin"
                  style={{ borderColor: THEME.gold, borderTopColor: "transparent" }}
                ></div>
              </div>
              <p className="text-sm font-medium" style={{ color: THEME.textMuted }}>
                Loading your subscriptions...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ================================================================
  // EMPTY
  // ================================================================
  if (!subscription) {
    return (
      <div className="flex h-screen" style={{ background: THEME.bg }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
              >
                <Package size={36} style={{ color: THEME.textDim }} strokeWidth={1.5} />
              </div>
              <h3
                className="text-2xl font-bold mb-3 mm-serif"
                style={{ color: THEME.text }}
              >
                No Subscriptions Found
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: THEME.textMuted }}>
                You don't have any active subscriptions. Choose a plan to get started.
              </p>
              <button
                onClick={() => navigate("/upgrades")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:brightness-110"
                style={{
                  background: `linear-gradient(180deg, #f9d384 0%, ${THEME.goldDeep} 100%)`,
                  border: "1px solid #f4d27e",
                  color: "#0b0b0b",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,.45), 0 8px 24px rgba(217,156,62,.35)",
                }}
              >
                View Plans
                <ArrowRight size={16} />
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    user: userInfo,
    currentPlan,
    allPlans,
    payments,
    totalPurchased,
    isActive,
  } = subscription;

  return (
    <div className="flex h-screen" style={{ background: THEME.bg }}>
      {/* Playfair Display + Inter fonts (local style injection) */}
      <style>{`
        .mm-serif { font-family: 'Playfair Display', Georgia, serif; }
        .mm-body { font-family: 'Inter', Arial, sans-serif; }
      `}</style>

      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight mm-serif"
                  style={{ color: THEME.text }}
                >
                  My Subscriptions
                </h1>
                <p className="text-sm mt-1" style={{ color: THEME.textMuted }}>
                  View all plans connected to your account and their current status.
                </p>
              </div>
              <a
                href="https://www.podcastai.live/upgrades"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:border-[#eac176]/50"
                style={{
                  background: THEME.panel,
                  border: `1px solid ${THEME.border}`,
                  color: THEME.text,
                }}
              >
                <Layers size={15} style={{ color: THEME.goldSoft }} />
                Compare Plans
              </a>
            </div>

            {/* ===== CURRENT PLAN HERO ===== */}
            {currentPlan && (
              <div
                className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6"
                style={{
                  background:
                    "radial-gradient(circle at 90% 10%, rgba(234,193,118,.18), transparent 55%), linear-gradient(105deg, #0a2233 0%, #06192a 100%)",
                  border: `1px solid ${THEME.goldBorder}`,
                  boxShadow:
                    "0 20px 50px -15px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -mr-24 -mt-24"
                  style={{ background: "rgba(234,193,118,.12)" }}
                ></div>
                <div
                  className="absolute inset-0 opacity-[.04]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#eac176 1px, transparent 1px), linear-gradient(90deg, #eac176 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                ></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: getPlanColor(currentPlan.planId).bg,
                        border: `1px solid ${getPlanColor(currentPlan.planId).border}`,
                      }}
                    >
                      <PlanIcon planId={currentPlan.planId} size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: THEME.goldSoft }}
                      >
                        <BadgeCheck size={12} />
                        Current Plan
                      </div>
                      <h2
                        className="text-2xl font-bold mm-serif"
                        style={{ color: THEME.text }}
                      >
                        {getPlanDisplayName(currentPlan)}
                      </h2>
                      <p className="text-sm mt-1" style={{ color: THEME.textMuted }}>
                        {isActive
                          ? "Active and providing access to your account"
                          : "Not currently active"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-6 md:gap-8 md:pl-6 md:border-l"
                    style={{ borderColor: THEME.goldBorder }}
                  >
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider font-medium mb-1"
                        style={{ color: THEME.textDim }}
                      >
                        Status
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          isActive
                            ? {
                                background: "rgba(125,227,184,.15)",
                                color: "#7de3b8",
                                border: "1px solid rgba(125,227,184,.35)",
                              }
                            : {
                                background: "rgba(234,193,118,.12)",
                                color: THEME.textMuted,
                                border: `1px solid ${THEME.goldBorder}`,
                              }
                        }
                      >
                        {isActive ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div
                className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(109,220,255,.12)",
                      border: "1px solid rgba(109,220,255,.3)",
                    }}
                  >
                    <Package size={14} style={{ color: "#6ddcff" }} />
                  </span>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums mm-serif"
                  style={{ color: THEME.text }}
                >
                  {totalSubscriptions}
                </p>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: THEME.textMuted }}
                >
                  Total Subscriptions
                </p>
              </div>

              <div
                className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden"
                style={{
                  background: THEME.panel,
                  border: "1px solid rgba(125,227,184,.3)",
                }}
              >
                <div
                  className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl"
                  style={{ background: "rgba(125,227,184,.15)" }}
                ></div>
                <div className="relative flex items-center justify-between mb-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(125,227,184,.12)",
                      border: "1px solid rgba(125,227,184,.3)",
                    }}
                  >
                    <CheckCircle size={14} style={{ color: "#7de3b8" }} />
                  </span>
                </div>
                <p
                  className="relative text-2xl font-bold tabular-nums mm-serif"
                  style={{ color: "#7de3b8" }}
                >
                  {activeSubscriptions}
                </p>
                <p
                  className="relative text-xs font-medium mt-0.5"
                  style={{ color: THEME.textMuted }}
                >
                  Active
                </p>
              </div>

              <div
                className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(255,143,168,.12)",
                      border: "1px solid rgba(255,143,168,.3)",
                    }}
                  >
                    <XCircle size={14} style={{ color: "#ff8fa8" }} />
                  </span>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums mm-serif"
                  style={{ color: "#ff8fa8" }}
                >
                  {cancelledSubscriptions}
                </p>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: THEME.textMuted }}
                >
                  Cancelled
                </p>
              </div>

              <div
                className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(255,207,103,.12)",
                      border: "1px solid rgba(255,207,103,.3)",
                    }}
                  >
                    <RefreshCw size={14} style={{ color: "#ffcf67" }} />
                  </span>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums mm-serif"
                  style={{ color: "#ffcf67" }}
                >
                  {refundedSubscriptions}
                </p>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: THEME.textMuted }}
                >
                  Refunded
                </p>
              </div>
            </div>

            {/* ===== SUBSCRIPTION LIST ===== */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-semibold uppercase tracking-wider mm-serif"
                style={{ color: THEME.text }}
              >
                Plan History
              </h2>
              <span className="text-xs" style={{ color: THEME.textMuted }}>
                {totalSubscriptions} total
              </span>
            </div>

            <div className="space-y-4">
              {allPlans && allPlans.length > 0 ? (
                allPlans.map((plan, index) => {
                  const statusColor = getStatusColor(plan.status);
                  const statusIcon = getStatusIcon(plan.status);
                  const statusMessage = getStatusMessage(plan.status);
                  const planName = getPlanDisplayName(plan);
                  const planColor = getPlanColor(plan.planId);
                  const isCurrent = plan.planId === currentPlan?.planId;

                  const startDate =
                    plan.purchaseDate || plan.createdAt || new Date();
                  const endDate =
                    plan.expiryDate ||
                    new Date(
                      new Date(startDate).getTime() +
                        365 * 24 * 60 * 60 * 1000
                    );

                  const source = plan.source || "Launchpad";
                  const transactionId =
                    plan.transactionId ||
                    `TXN-${String(plan.planId).padStart(4, "0")}-${String(
                      Date.now() + index
                    ).slice(-6)}`;

                  return (
                    <div
                      key={plan.planId}
                      className="rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={
                        isCurrent
                          ? {
                              background:
                                "linear-gradient(180deg, #0a2233, #07192a)",
                              border: "1.5px solid rgba(234,193,118,.55)",
                              boxShadow:
                                "0 0 0 4px rgba(234,193,118,.12), 0 10px 30px rgba(0,0,0,.4)",
                            }
                          : {
                              background: THEME.panel,
                              border: `1px solid ${THEME.border}`,
                              opacity: 0.95,
                            }
                      }
                    >
                      {/* ===== PLAN HEADER ===== */}
                      <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: `1px solid ${THEME.border}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background: planColor.bg,
                              border: `1px solid ${planColor.border}`,
                            }}
                          >
                            <PlanIcon planId={plan.planId} size={20} strokeWidth={2} />
                          </div>
                          <div>
                            <h3
                              className="text-base font-semibold flex items-center gap-2"
                              style={{ color: THEME.text }}
                            >
                              {planName}
                              {isCurrent && (
                                <span
                                  className="px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1"
                                  style={{
                                    background:
                                      "linear-gradient(100deg, #f9d384, #d99c3e)",
                                    color: "#0b0b0b",
                                    boxShadow:
                                      "0 2px 8px rgba(217,156,62,.4)",
                                  }}
                                >
                                  <Zap size={10} className="fill-current" />
                                  Current
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p
                                className="text-xs flex items-center gap-1"
                                style={{ color: THEME.textMuted }}
                              >
                                <Hash size={10} /> Plan ID: {plan.planId}
                              </p>
                              <span
                                className="w-1 h-1 rounded-full"
                                style={{ background: THEME.border }}
                              ></span>
                              <p
                                className="text-xs flex items-center gap-1"
                                style={{ color: THEME.textMuted }}
                              >
                                <Package size={10} />{" "}
                                {plan.validityDays || 365} days
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{
                              background: statusColor.bg,
                              border: `1px solid ${statusColor.border}`,
                              color: statusColor.fg,
                            }}
                          >
                            {statusIcon}
                            {plan.status || "Active"}
                          </span>
                        </div>
                      </div>

                      {/* ===== PLAN DETAILS ===== */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2.5">
                            <div
                              className="flex items-center gap-2.5 p-2 rounded-lg"
                              style={{
                                background: "rgba(6,20,42,.6)",
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "rgba(255,207,103,.12)",
                                  border: "1px solid rgba(255,207,103,.3)",
                                }}
                              >
                                <Calendar size={13} style={{ color: "#ffcf67" }} />
                              </div>
                              <div>
                                <p
                                  className="text-[10px] font-medium uppercase tracking-wider"
                                  style={{ color: THEME.textDim }}
                                >
                                  Started
                                </p>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: THEME.text }}
                                >
                                  {formatDate(startDate)}
                                </p>
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-2.5 p-2 rounded-lg"
                              style={{
                                background: "rgba(6,20,42,.6)",
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "rgba(125,227,184,.12)",
                                  border: "1px solid rgba(125,227,184,.3)",
                                }}
                              >
                                <CalendarDays
                                  size={13}
                                  style={{ color: "#7de3b8" }}
                                />
                              </div>
                              <div>
                                <p
                                  className="text-[10px] font-medium uppercase tracking-wider"
                                  style={{ color: THEME.textDim }}
                                >
                                  Valid Until
                                </p>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: THEME.text }}
                                >
                                  {formatDate(endDate)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <div
                              className="flex items-center gap-2.5 p-2 rounded-lg"
                              style={{
                                background: "rgba(6,20,42,.6)",
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "rgba(234,193,118,.12)",
                                  border: "1px solid rgba(234,193,118,.3)",
                                }}
                              >
                                <Tag size={13} style={{ color: THEME.gold }} />
                              </div>
                              <div>
                                <p
                                  className="text-[10px] font-medium uppercase tracking-wider"
                                  style={{ color: THEME.textDim }}
                                >
                                  Source
                                </p>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: THEME.text }}
                                >
                                  {source}
                                </p>
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-2.5 p-2 rounded-lg"
                              style={{
                                background: "rgba(6,20,42,.6)",
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "rgba(255,207,103,.12)",
                                  border: "1px solid rgba(255,207,103,.3)",
                                }}
                              >
                                <Hash size={13} style={{ color: "#ffcf67" }} />
                              </div>
                              <div>
                                <p
                                  className="text-[10px] font-medium uppercase tracking-wider"
                                  style={{ color: THEME.textDim }}
                                >
                                  Transaction
                                </p>
                                <p
                                  className="text-xs font-medium font-mono"
                                  style={{ color: THEME.text }}
                                >
                                  {transactionId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== STATUS MESSAGE ===== */}
                        <div
                          className="mt-4 pt-4"
                          style={{ borderTop: `1px solid ${THEME.border}` }}
                        >
                          <div
                            className="flex items-start gap-2.5 p-3 rounded-xl"
                            style={{
                              background: "rgba(6,20,42,.7)",
                              border: `1px solid ${THEME.goldBorder}`,
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background: "rgba(234,193,118,.15)",
                                border: "1px solid rgba(234,193,118,.35)",
                              }}
                            >
                              <Info size={13} style={{ color: THEME.goldSoft }} />
                            </div>
                            <div>
                              <p
                                className="text-[10px] font-medium uppercase tracking-wider"
                                style={{ color: THEME.textDim }}
                              >
                                Status Message
                              </p>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: THEME.textMuted }}
                              >
                                {statusMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className="rounded-xl p-12 text-center"
                  style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
                >
                  <Package
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: THEME.textDim, opacity: 0.3 }}
                  />
                  <p className="text-sm" style={{ color: THEME.textMuted }}>
                    No subscriptions found
                  </p>
                </div>
              )}
            </div>

            {/* ===== FOOTER ===== */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center">
              <Headphones size={14} style={{ color: THEME.goldSoft }} />
              <p className="text-xs" style={{ color: THEME.textMuted }}>
                Need help with your subscriptions?{" "}
                <a
                  href="/support"
                  className="font-medium hover:underline"
                  style={{ color: THEME.goldBright }}
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subscription;