// frontend/src/pages/UpgradeRequired.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, ArrowLeft } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

// ================================================================
// 🎨 THEME — matches the rest of the app
// ================================================================
const C = {
  mainBg: "#000C16",
  sidebar: "#00101A",
  card: "#031520",
  cardSecondary: "#0C1926",
  input: "#000611",
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
};

export default function UpgradeRequired() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: C.mainBg }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 grid place-items-center p-6">
          <div
            className="max-w-md w-full rounded-2xl p-8 text-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 0%, rgba(246,197,93,.08), transparent 60%), ${C.card}`,
              border: `1px solid ${C.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,.45)",
            }}
          >
            {/* Lock icon */}
            <div
              className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-5"
              style={{
                background: "linear-gradient(140deg, #3a2a11, #5a3e18)",
                border: `1px solid ${C.darkGold}`,
                boxShadow: `0 0 24px rgba(183,123,50,.35)`,
              }}
            >
              <Lock size={28} style={{ color: C.gold }} />
            </div>

            {/* Heading */}
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: C.heading }}
            >
              Upgrade Required
            </h2>

            {/* Description */}
            <p
              className="text-[13.5px] mb-6 leading-relaxed"
              style={{ color: C.secondary }}
            >
              This page is only available on higher plans. Upgrade to unlock
              premium features.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Secondary — Go Back */}
              <button
                onClick={() => navigate(-1)}
                className="flex-1 h-[44px] rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-2 transition"
                style={{
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  color: C.heading,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.cardSecondary;
                  e.currentTarget.style.borderColor = C.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.input;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <ArrowLeft size={14} />
                Go Back
              </button>

              {/* Primary — See Plans (gold gradient) */}
              <button
                onClick={() => navigate("https://www.mysterymintai.live/upgrades")}
                className="flex-1 h-[44px] rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px]"
                style={{
                  background: C.goldGradient,
                  color: C.mainBg,
                  border: `1px solid ${C.goldHover}`,
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                <Crown size={14} />
                See Plans
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
