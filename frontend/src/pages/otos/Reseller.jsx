// frontend/src/pages/ResellerThankYou.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
  CheckCircle,
  Gift,
  Rocket,
  Headphones,
  Copy,
  Check,
  Users,
  ArrowRight,
  Ticket,
  UserCheck,
  Store,
  Megaphone,
  ThumbsUp,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

// ================================================================
// 🎨 THEME — matches the rest of the app
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
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
};

const ResellerThankYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate reseller code without DB call
  const resellerCode = "RES-" + Date.now().toString().slice(-8);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleContactSupport = () => {
    navigate("/support/ticket");
  };

  const steps = [
    {
      id: 1,
      icon: UserCheck,
      title: "Reseller Access Activated",
      description:
        "Your reseller purchase has been successfully activated. You're now ready to request your reseller setup.",
    },
    {
      id: 2,
      icon: Ticket,
      title: "Contact Support For Setup",
      description:
        "Open a support ticket and provide your purchase details along with your preferred reseller information.",
    },
    {
      id: 3,
      icon: Clock,
      title: "Verification & Setup",
      description:
        "Our team will verify your request and guide you through the reseller setup process within 24 hours.",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: C.mainBg }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* ============================================================
                HERO — dark navy with gold accents
                ============================================================ */}
            <div
              className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-6"
              style={{
                background:
                  "linear-gradient(135deg, #000C16 0%, #031520 50%, #00101A 100%)",
                border: `1px solid ${C.gold}33`,
                boxShadow: `0 20px 50px -15px rgba(0,0,0,.6), 0 0 60px rgba(246,197,93,.08)`,
              }}
            >
              {/* Background Decorations */}
              <div
                className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -mr-24 -mt-24"
                style={{ background: "rgba(246,197,93,.08)" }}
              />
              <div
                className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl -ml-20 -mb-20"
                style={{ background: "rgba(246,197,93,.05)" }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
                style={{ background: "rgba(246,197,93,.03)" }}
              />

              {/* Fine grid texture */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(${C.gold} 1px, transparent 1px), linear-gradient(90deg, ${C.gold} 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />

              <div
                className="absolute top-4 right-8 text-2xl opacity-20"
                style={{ color: C.gold }}
              >
                ✦
              </div>
              <div
                className="absolute bottom-4 left-8 text-xl opacity-20"
                style={{ color: C.gold }}
              >
                ✦
              </div>

              <div className="relative z-10 text-center">
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 backdrop-blur-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(246,197,93,.25), rgba(246,197,93,.08))",
                    border: `1px solid ${C.gold}55`,
                    boxShadow: `0 0 40px -8px rgba(246,197,93,.45)`,
                  }}
                >
                  <CheckCircle
                    className="w-11 h-11"
                    style={{ color: C.gold }}
                    strokeWidth={1.75}
                  />
                </div>

                <h1
                  className="font-['Playfair_Display',Georgia,serif] text-3xl md:text-5xl font-bold mb-3 tracking-tight"
                  style={{ color: C.heading }}
                >
                  Reseller Access Activated
                </h1>
                <p
                  className="text-lg max-w-2xl mx-auto mb-8"
                  style={{ color: C.goldHover, opacity: 0.9 }}
                >
                  Welcome to the Reseller Program. You're now ready to start
                  offering this AI platform to your own customers.
                </p>

                {/* Reseller code card */}
                <div
                  className="inline-flex items-center gap-3 backdrop-blur-sm rounded-xl px-5 py-3"
                  style={{
                    background: "rgba(246,197,93,.06)",
                    border: `1px solid rgba(246,197,93,.2)`,
                  }}
                >
                  <div className="text-left">
                    <p
                      className="text-[10px] uppercase tracking-wider font-medium mb-0.5"
                      style={{ color: C.secondary }}
                    >
                      Your Reseller Reference
                    </p>
                    <p
                      className="font-mono text-lg font-semibold tabular-nums tracking-wide"
                      style={{ color: C.heading }}
                    >
                      {resellerCode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(resellerCode)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                    style={{
                      background: "rgba(246,197,93,.15)",
                      border: `1px solid rgba(246,197,93,.3)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(246,197,93,.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(246,197,93,.15)";
                    }}
                    aria-label="Copy reseller code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" style={{ color: C.gold }} />
                    ) : (
                      <Copy className="w-4 h-4" style={{ color: C.gold }} />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-2.5" style={{ color: C.muted }}>
                  Reference this code when you open your support ticket
                </p>
              </div>
            </div>

            {/* ============================================================
                STEPS — dark card
                ============================================================ */}
            <div
              className="rounded-2xl p-6 md:p-8 mb-6"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,.2), 0 8px 24px -8px rgba(0,0,0,.3)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="font-['Playfair_Display',Georgia,serif] text-xl font-bold flex items-center gap-3"
                  style={{ color: C.heading }}
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-lg"
                    style={{
                      background: "rgba(246,197,93,.15)",
                      border: `1px solid ${C.gold}55`,
                    }}
                  >
                    <Rocket className="w-5 h-5" style={{ color: C.gold }} />
                  </span>
                  Next Steps
                </h2>
                <span className="text-xs font-medium" style={{ color: C.muted }}>
                  3 steps · ~5 min
                </span>
              </div>

              <div className="relative space-y-3">
                {/* Connector line */}
                <div
                  className="absolute left-[1.6rem] top-8 bottom-8 w-px hidden sm:block"
                  style={{ background: C.border }}
                />

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                      style={{
                        background: "rgba(0,6,17,.4)",
                        border: `1px solid transparent`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(246,197,93,.06)";
                        e.currentTarget.style.borderColor = `${C.gold}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0,6,17,.4)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <div className="flex-shrink-0 relative z-10">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            background: C.input,
                            border: `1px solid ${C.gold}40`,
                            boxShadow: "0 2px 8px rgba(0,0,0,.3)",
                          }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: C.gold }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "rgba(246,197,93,.2)",
                              color: C.gold,
                            }}
                          >
                            {index + 1}
                          </span>
                          <h3
                            className="font-semibold"
                            style={{ color: C.heading }}
                          >
                            {step.title}
                          </h3>
                        </div>
                        <p
                          className="text-sm mt-1 leading-relaxed"
                          style={{ color: C.secondary }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================
                CONTACT SUPPORT — gold-tinted card
                ============================================================ */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(246,197,93,.1), rgba(183,123,50,.05))",
                border: `1px solid ${C.gold}40`,
              }}
            >
              <div
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl"
                style={{ background: "rgba(246,197,93,.15)" }}
              />
              <div className="relative text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{
                    background: C.input,
                    border: `1px solid ${C.gold}55`,
                    boxShadow: "0 4px 16px rgba(0,0,0,.3)",
                  }}
                >
                  <Headphones
                    className="w-8 h-8"
                    style={{ color: C.gold }}
                    strokeWidth={1.75}
                  />
                </div>
                <h2
                  className="font-['Playfair_Display',Georgia,serif] text-2xl font-bold mb-2"
                  style={{ color: C.heading }}
                >
                  Contact Support For Reseller Setup
                </h2>
                <p
                  className="max-w-2xl mx-auto mb-6 leading-relaxed"
                  style={{ color: C.secondary }}
                >
                  Open a support ticket with your purchase details and preferred
                  reseller information. Our team verifies and guides you through
                  setup within 24 hours.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-[1px]"
                  style={{
                    background: C.goldGradient,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 1px rgba(255,255,255,.35), 0 12px 28px rgba(246,197,93,.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)";
                  }}
                >
                  <Ticket className="w-5 h-5" />
                  Open Support Ticket
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p
                  className="flex items-center justify-center gap-1.5 text-xs mt-4"
                  style={{ color: C.muted }}
                >
                  <ShieldCheck
                    className="w-3.5 h-3.5"
                    style={{ color: C.gold }}
                  />
                  Our support team typically responds within 24 hours
                </p>
              </div>
            </div>

            {/* ============================================================
                FOOTER CTA — dark with gold accents
                ============================================================ */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, #000C16 0%, #031520 100%)",
                border: `1px solid ${C.gold}33`,
                boxShadow: `0 20px 50px -15px rgba(0,0,0,.6), 0 0 60px rgba(246,197,93,.06)`,
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl"
                style={{ background: "rgba(246,197,93,.1)" }}
              />
              <div className="relative flex items-center justify-center gap-2 mb-4 flex-wrap">
                <Sparkles className="w-6 h-6" style={{ color: C.gold }} />
                <h2
                  className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl font-bold"
                  style={{ color: C.heading }}
                >
                  Ready to Start Selling?
                </h2>
                <Sparkles className="w-6 h-6" style={{ color: C.gold }} />
              </div>
              <p
                className="relative max-w-2xl mx-auto mb-6"
                style={{ color: C.secondary }}
              >
                You're all set. Contact our support team to complete your
                reseller setup and start offering this platform to your
                customers today.
              </p>
              <button
                onClick={handleContactSupport}
                className="relative px-7 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-[1px]"
                style={{
                  background: C.goldGradient,
                  color: C.mainBg,
                  border: `1px solid ${C.goldHover}`,
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 1px rgba(255,255,255,.35), 0 12px 28px rgba(246,197,93,.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)";
                }}
              >
                Contact Support Now
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResellerThankYou;