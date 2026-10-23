// frontend/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.png";
import logo from "../../assets/nav-logo.png";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  Users,
  XCircle,
  Clock,
  ShieldCheck,
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
// RESET PASSWORD CARD — 3 states (checking / invalid / valid form)
// ================================================================
function ResetPasswordCard({
  password,
  setPassword,
  loading,
  handleSubmit,
  valid,
  checking,
}) {
  const [showPassword, setShowPassword] = useState(false);

  // -------- STATE 1: CHECKING --------
  if (checking) {
    return (
      <div className="mm-login-panel mm-glass relative z-10 w-[40%] max-w-[585px] rounded-[27px] px-[51px] pb-[45px] pt-[28px] text-center">
        {/* LOGO */}
        <div className="mm-logo-slot">
          <img src={logo} alt="MysteryMint AI" />
        </div>

        {/* Spinner */}
        <div
          className="mx-auto grid place-items-center"
          style={{
            marginTop: 10,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(234,193,118,.18), transparent 70%)",
            border: "1px solid rgba(234,193,118,.35)",
          }}
        >
          <svg
            className="animate-spin"
            width="34"
            height="34"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="rgba(255,225,164,.9)"
              strokeWidth="3"
              fill="none"
              opacity="0.25"
            />
            <path
              fill="rgba(255,225,164,.95)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <h2 className="mm-serif mm-login-heading mt-4 text-center text-[30px] font-semibold leading-tight text-white">
          Verifying Link...
        </h2>
        <p className="mt-2 text-center text-[16px] leading-[1.4] text-[#aeb5be]">
          Please wait while we verify your reset link.
        </p>
      </div>
    );
  }

  // -------- STATE 2: INVALID --------
  if (!valid) {
    return (
      <div
        className="mm-login-panel mm-glass relative z-10 w-[40%] max-w-[585px] rounded-[27px] px-[51px] pb-[45px] pt-[28px] text-center"
        style={{
          border: "1px solid rgba(239,68,68,.35)",
        }}
      >
        {/* LOGO */}
        <div className="mm-logo-slot">
          <img src={logo} alt="MysteryMint AI" />
        </div>

        {/* Error icon */}
        <div
          className="mx-auto grid place-items-center"
          style={{
            marginTop: 10,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,80,80,.2), transparent 70%)",
            border: "1px solid rgba(239,68,68,.45)",
          }}
        >
          <XCircle size={34} style={{ color: "#f87171" }} />
        </div>

        <h2 className="mm-serif mm-login-heading mt-4 text-center text-[34px] font-semibold leading-tight text-white">
          Invalid Link
        </h2>
        <p className="mt-2 text-center text-[17px] leading-[1.4] text-[#aeb5be]">
          This password reset link has expired or is invalid.
        </p>

        {/* Expiry notice */}
        <div
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2.5"
          style={{
            border: "1px solid rgba(251,191,36,.3)",
            background:
              "linear-gradient(90deg, rgba(251,191,36,.14), rgba(245,158,11,.14))",
          }}
        >
          <Clock size={14} style={{ color: "#fcd34d", flexShrink: 0 }} />
          <span className="text-[12px] font-medium tracking-[.2px] text-amber-100">
            Reset links expire after 1 hour
          </span>
        </div>

        {/* Request new link */}
        <Link
          to="/forgot-password"
          className="mm-gold-button mt-5 flex h-[58px] w-full items-center justify-center gap-3 rounded-[11px] text-[19px] font-semibold"
        >
          <span>←</span>
          <span>Request New Link</span>
        </Link>

        {/* Back to login */}
        <p className="mt-[30px] text-center text-[16px] text-[#c4c7cc]">
          Remembered it?{" "}
          <Link
            to="/login"
            className="ml-2 font-semibold text-[#ffcf67] hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  // -------- STATE 3: VALID FORM --------
  return (
    <section className="mm-login-panel mm-glass relative z-10 w-[40%] max-w-[585px] rounded-[27px] px-[51px] pb-[45px] pt-[28px]">
      {/* LOGO */}
      <div className="mm-logo-slot">
        <img src={logo} alt="MysteryMint AI" />
      </div>

      {/* HEADER */}
      <h2 className="mm-serif mm-login-heading mt-1 text-center text-[39px] font-semibold leading-tight text-white">
        Set New Password
      </h2>
      <p className="mt-2 text-center text-[19px] leading-[1.4] text-[#aeb5be]">
        Enter your new password below.
        <br className="hidden sm:block" /> Make it strong and memorable.
      </p>

      {/* FORM */}
      <form
        className="mt-[27px] space-y-[17px]"
        onSubmit={handleSubmit}
        autoComplete="on"
      >
        {/* PASSWORD */}
        <label className="mm-field">
          <LockKeyhole
            width="24"
            height="24"
            strokeWidth="1.7"
            style={{ flexShrink: 0 }}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            autoComplete="new-password"
            required
            minLength={6}
            aria-label="New Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="shrink-0 text-[#aab4be] transition hover:text-white"
          >
            {showPassword ? (
              <Eye width="24" height="24" strokeWidth="1.7" />
            ) : (
              <EyeOff width="24" height="24" strokeWidth="1.7" />
            )}
          </button>
        </label>

        {/* HINT */}
        <p className="text-[12px] leading-[1.4] text-[#8b95a5]">
          Password must be at least 6 characters long.
        </p>

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
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
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
  );
}

// ================================================================
// MAIN COMPONENT (logic unchanged)
// ================================================================
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/password/verify/${token}`);
        setValid(true);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/reset", { token, password });
      toast.success("Password reset successful!");
      navigate("/login");
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
          Create a <span className="text-[#c6b19a]">New Password</span>
        </p>
        <h1 className="mm-serif mm-hero-title mt-0 text-[clamp(50px,5.05vw,79px)] font-semibold leading-[.99] tracking-[-2px]">
          <span className="mm-gold-text">Secure Your</span>
          <br />
          <span className="mm-gold-text">Account</span>{" "}
          <span className="text-[#f7f2e9]">Safely</span>
        </h1>
        <p className="mm-hero-copy mt-5 text-[20px] leading-[1.5] text-white">
          Choose a strong password with at least 6 characters
          <br />
          We&apos;ll update your account and send you back to sign in.
        </p>

        <div className="mt-6 flex max-w-[430px] items-start gap-6 text-center">
          <div className="flex-1">
            <div className="mm-feature-icon">
              <LockKeyhole width="39" height="39" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Secure Password
              <br />
              Reset
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <ShieldCheck width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Account
              <br />
              Protected
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <Sparkles width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Strong &amp;
              <br />
              Memorable
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RIGHT — RESET PASSWORD PANEL */}
      {/* ============================================ */}
      <ResetPasswordCard
        password={password}
        setPassword={setPassword}
        loading={loading}
        handleSubmit={handleSubmit}
        valid={valid}
        checking={checking}
      />
    </main>
  );
};

export default ResetPassword;