// frontend/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.png";
import logo from "../../assets/nav-logo.png";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  UsersRound,
  Package,
} from "lucide-react";

// ================================================================
// GLOBAL STYLES — MysteryMint AI theme (matches Login.jsx)
// ================================================================
function LoginStyles() {
  return (
    <style>{`
      .mm-serif { font-family: 'Playfair Display', Georgia, serif; }

      .mm-gold-text {
        background: linear-gradient(110deg, #d9a44e 0%, #ffe4a0 55%, #fff1c8 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .mm-scene {
        background-color: #061b28;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }

      .mm-glass {
        background: linear-gradient(125deg, rgba(13,23,32,.89), rgba(19,20,24,.91));
        border: 1px solid rgba(206,217,226,.24);
        box-shadow: 0 22px 65px rgba(0,0,0,.4);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }

      .mm-field {
        height: 59px;
        background: rgba(3,10,16,.53);
        border: 1px solid #5b626b;
        border-radius: 11px;
        display: flex;
        align-items: center;
        gap: 19px;
        padding: 0 20px;
        color: #aab4be;
        transition: border-color .2s ease;
      }
      .mm-field:focus-within { border-color: #eac176; }

      .mm-field input {
        background: transparent;
        border: 0;
        outline: 0;
        color: #fff;
        width: 100%;
        font-size: 18px;
        min-width: 0;
      }
      .mm-field input::placeholder { color: #69717c; }

      .mm-gold-button {
        background: linear-gradient(180deg, #f9d384 0%, #d99c3e 100%);
        border: 1px solid #f4d27e;
        color: #0b0b0b;
        box-shadow: inset 0 1px 1px rgba(255,255,255,.45);
        transition: filter .2s ease, transform .2s ease;
      }
      .mm-gold-button:hover:not(:disabled) {
        filter: brightness(1.06);
        transform: translateY(-1px);
      }
      .mm-gold-button:active:not(:disabled) { transform: translateY(0); }
      .mm-gold-button:disabled { opacity: .55; cursor: not-allowed; }

      .mm-feature-icon {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(1,14,24,.7);
        color: #ffe1a4;
        margin: 0 auto 6px;
      }

      .mm-logo-slot {
        height: 254px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mm-logo-slot img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
      }

      /* Responsive */
      @media (max-width: 1100px) {
        .mm-hero-title { font-size: clamp(42px, 5vw, 76px) !important; }
        .mm-login-panel { width: 48% !important; }
        .mm-hero { width: 52% !important; }
      }

      @media (max-width: 800px) {
        .mm-page {
          min-height: 100vh;
          height: auto !important;
          display: block !important;
          padding: 32px 18px !important;
        }
        .mm-hero {
          width: 100% !important;
          padding: 15px 0 35px !important;
        }
        .mm-login-panel {
          width: 100% !important;
          max-width: 585px;
          margin: auto;
        }
        .mm-hero-title { font-size: 48px !important; }
        .mm-hero-copy { font-size: 16px !important; }
        .mm-glass { padding: 26px !important; }
        .mm-logo-slot { height: 150px; }
        .mm-login-heading { margin-top: 5px !important; }
        .mm-feature-icon { width: 55px; height: 55px; }
        .mm-feature-icon svg { width: 29px; height: 29px; }
        .mm-feature-caption { font-size: 12px !important; }
      }
    `}</style>
  );
}

// ================================================================
// MAIN COMPONENT (logic unchanged)
// ================================================================
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/forgot", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="mm-scene mm-page relative flex min-h-screen w-full items-center overflow-hidden px-[3%] xl:px-[3%] 2xl:px-[3%]"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <LoginStyles />

      {/* ===== BLACK OVERLAY ===== */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", zIndex: 1 }}
      />

      {/* ===== GRADIENT OVERLAY ===== */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"
        style={{ zIndex: 2 }}
      />

      {/* ============================================ */}
      {/* LEFT HERO */}
      {/* ============================================ */}
      <section
        className="mm-hero relative z-10 w-[57%] pl-[8%] xl:pl-[8%]"
        style={{ paddingLeft: "8%" }}
      >
        <p className="mm-serif text-[35px] leading-tight text-[#e8e6e3]">
          Forgot <span className="text-[#c6b19a]">Password?</span>
        </p>
        <h1 className="mm-serif mm-hero-title mt-0 text-[clamp(50px,5.05vw,79px)] font-semibold leading-[.99] tracking-[-2px]">
          <span className="mm-gold-text">Reset Your</span>
          <br />
          <span className="mm-gold-text">Account</span>{" "}
          <span className="text-[#f7f2e9]">Safely</span>
        </h1>
        <p className="mm-hero-copy mt-5 text-[20px] leading-[1.5] text-white">
          Enter your email and we&apos;ll send a secure reset link
          <br />
          No waiting. No hassle. Just click and reset.
        </p>

        <div className="mt-6 flex max-w-[430px] items-start gap-6 text-center">
          <div className="flex-1">
            <div className="mm-feature-icon">
              <LockKeyhole width="39" height="39" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Secure Reset
              <br />
              Link
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <Sparkles width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Quick &amp; Easy
              <br />
              Process
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <Users width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              24/7 Human
              <br />
              Support
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RIGHT — FORGOT PASSWORD PANEL */}
      {/* ============================================ */}
      <section className="mm-login-panel mm-glass relative z-10 w-[40%] max-w-[585px] rounded-[27px] px-[51px] pb-[45px] pt-[28px]">
        {/* LOGO */}
        <div className="mm-logo-slot">
          <img src={logo} alt="MysteryMint AI" />
        </div>

        {/* HEADER */}
        <h2 className="mm-serif mm-login-heading mt-1 text-center text-[39px] font-semibold leading-tight text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-[19px] leading-[1.4] text-[#aeb5be]">
          Enter your email to receive a reset link.
          <br className="hidden sm:block" /> We&apos;ll take care of the rest.
        </p>

        {/* SUCCESS BADGE */}
        {sent && (
          <div
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2.5"
            style={{
              border: "1px solid rgba(34,197,94,.35)",
              background:
                "linear-gradient(90deg, rgba(34,197,94,.18), rgba(16,185,129,.18))",
            }}
          >
            <CheckCircle2 size={14} style={{ color: "#86efac", flexShrink: 0 }} />
            <span className="text-[12px] font-medium tracking-[.2px] text-green-100">
              Reset link sent! Check your email.
            </span>
          </div>
        )}

        {/* FORM */}
        <form
          className="mt-[27px] space-y-[17px]"
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          {/* EMAIL */}
          <label className="mm-field">
            <Mail width="24" height="24" strokeWidth="1.7" style={{ flexShrink: 0 }} />
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              required
              aria-label="Email Address"
            />
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mm-gold-button mt-2 flex h-[58px] w-full items-center justify-center gap-3 rounded-[11px] text-[21px] font-semibold"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight width="25" height="25" strokeWidth="2.2" />
              </>
            )}
          </button>
        </form>

        {/* BACK TO LOGIN */}
        <p className="mt-[36px] text-center text-[16px] text-[#c4c7cc]">
          Remembered it?{" "}
          <Link
            to="/login"
            className="ml-2 font-semibold text-[#ffcf67] hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;