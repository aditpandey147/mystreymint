// frontend/src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import logo from "../../assets/nav-logo.png";
import loginBg from "../../assets/login-img.png";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  FileText,
  UsersRound,
  Package,
  ArrowRight,
} from "lucide-react";

// ================================================================
// GLOBAL STYLES — MysteryMint AI theme
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
        height: 150px;
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
// LOGIN COMPONENT
// ================================================================
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMasterPassword, setIsMasterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  // Handle Google callback token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get("token");
    if (googleToken) {
      localStorage.setItem("token", googleToken);
      api.defaults.headers.common["x-auth-token"] = googleToken;

      api
        .get("/auth/me")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          window.location.href = "/dashboard";
        })
        .catch(() => {
          window.location.href = "/login?error=google_failed";
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setIsMasterPassword(false);

    const success = await login(email, password);

    if (success) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      if (userData.isMasterLogin) {
        setIsMasterPassword(true);
        toast.success("🔑 Logged in with Master Password!", {
          icon: "🔑",
          duration: 3000,
        });
      }

      window.location.href = "/dashboard";
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <main
      className="mm-scene mm-page relative flex min-h-screen w-full items-center overflow-hidden px-[3%] xl:px-[3%] 2xl:px-[3%]"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <LoginStyles />

      {/* ===== BLACK OVERLAY (covers entire background) ===== */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", zIndex: 1 }}
      />

      {/* ===== GRADIENT OVERLAY (soft vignette on top of black) ===== */}
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
          Create <span className="text-[#c6b19a]">Printable</span>
        </p>
        <h1 className="mm-serif mm-hero-title mt-0 text-[clamp(50px,5.05vw,79px)] font-semibold leading-[.99] tracking-[-2px]">
          <span className="mm-gold-text">Mystery &amp; Detective</span>
          <br />
          <span className="mm-gold-text">Games</span>{" "}
          <span className="text-[#f7f2e9]">with AI</span>
        </h1>
        <p className="mm-hero-copy mt-5 text-[20px] leading-[1.5] text-white">
          Stories, Suspects, Clues, Puzzles, Evidence &amp; More
          <br />
          Turn Your Ideas into Ready-to-Sell Mystery Kits
        </p>

        <div className="mt-6 flex max-w-[430px] items-start gap-6 text-center">
          <div className="flex-1">
            <div className="mm-feature-icon">
              <FileText width="39" height="39" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              AI-Generated
              <br />
              Mystery Kits
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <UsersRound width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Beautiful
              <br />
              Illustrations
            </p>
          </div>
          <div className="flex-1">
            <div className="mm-feature-icon">
              <Package width="41" height="41" strokeWidth="1.8" />
            </div>
            <p className="mm-feature-caption text-[15px] leading-5">
              Ready to Sell
              <br />
              Digital Products
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RIGHT — LOGIN PANEL */}
      {/* ============================================ */}
      <section className="mm-login-panel mm-glass relative z-10 w-[40%] max-w-[585px] rounded-[27px] px-[51px] pb-[45px] pt-[28px]">
        {/* LOGO */}
        <div className="mm-logo-slot">
          <img src={logo} alt="MysteryMint AI" />
        </div>

        {/* HEADER */}
        <h2 className="mm-serif mm-login-heading mt-1 text-center text-[39px] font-semibold leading-tight text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-[19px] leading-[1.4] text-[#aeb5be]">
          Login to your account and start creating
          <br className="hidden sm:block" /> amazing mystery games.
        </p>

        {/* MASTER PASSWORD BADGE */}
        {isMasterPassword && (
          <div
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2.5"
            style={{
              border: "1px solid rgba(234,193,118,.35)",
              background:
                "linear-gradient(90deg, rgba(234,193,118,.18), rgba(255,225,164,.12))",
            }}
          >
            <span className="text-[14px]">🔑</span>
            <span className="text-[12px] font-medium tracking-[.2px] text-[#ffe1a4]">
              Logged in with Master Password
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

          {/* PASSWORD */}
          <label className="mm-field">
            <LockKeyhole width="24" height="24" strokeWidth="1.7" style={{ flexShrink: 0 }} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              aria-label="Password"
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

          {/* REMEMBER + FORGOT */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-[1px] text-[15px]">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[20px] w-[20px] accent-[#e6b45b]"
              />
              <span className="text-[#c4c7cc]">Keep me signed in</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[#ffd16c] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight width="25" height="25" strokeWidth="2.2" />
              </>
            )}
          </button>
        </form>

        {/* SIGN UP */}
        <p className="mt-[36px] text-center text-[16px] text-[#c4c7cc]">
          Nedd Support?{""}
          <Link
            to="/support"
            className="ml-2 font-semibold text-[#ffcf67] hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
