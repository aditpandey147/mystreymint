// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeatures } from "../hooks/useFeatures";
import logo from "../assets/sidebar-logo.png";
import api from "../services/api";
import {
  LayoutDashboard,
  Plus,
  Box,
  Crown,
  ChartLine,
  Images,
  Video,
  DollarSign,
  GraduationCap,
  Rocket,
  Headset,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  FolderOpen,
  Gift,
  Lightbulb,
  LayoutGrid,
  Film,
  Flame,
  Infinity as InfinityIcon,
  TrendingUp,
  Palette,
  Building2,
  Package,
  BarChart3,
  SquarePen,
  BookOpen,
  UsersRound,
  Search,
  Puzzle as PuzzleIcon,
  DoorOpen,
  Tag,
  PartyPopper,
} from "lucide-react";

// ================================================================
// 🎨 THEME — new :root palette
// ================================================================
const THEME = {
  // Sidebar background: deep navy from :root (--sidebar-bg + --main-bg)
  sidebarBg: "linear-gradient(160deg, #00101A 0%, #000C16 100%)",
  sidebarBorder: "#29414C",

  // Nav text
  navDefault: "#F5F5F3",
  navHoverBg: "#031520",

  // Active nav: gold gradient from :root
  navActiveBg: "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
  navActiveBorder: "#FFD36D",
  navActiveText: "#000C16",

  // Section headers
  sectionText: "#AAB3B9",

  // User area
  divider: "#29414C",

  // Dropdown panel
  dropdownBg: "#031520",
  dropdownBorder: "#29414C",

  // Upgrade card (gold accent)
  upgradeBg: "linear-gradient(120deg, #0C1926, #031520)",
  upgradeBorder: "#29414C",
  goldIcon: "#FFD36D",

  // Gold gradient for buttons and accents
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
  goldBorder: "#FFD36D",
  goldText: "#000C16",

  // Primary gold
  gold: "#F6C55D",
  goldHover: "#FFD36D",

  // Turquoise accent
  turquoise: "#00D4D9",

  // Text
  heading: "#F5F5F3",
  secondary: "#AAB3B9",
  muted: "#707F88",
};

// ================================================================
// WAVE LOGO — kept as-is
// ================================================================
function WaveLogo() {
  const heights = [17, 27, 38, 27, 17];
  return (
    <div className="flex items-center gap-[3px]" style={{ width: 42 }}>
      {heights.map((h, i) => (
        <i
          key={i}
          style={{
            display: "block",
            width: 5,
            height: h,
            borderRadius: 9,
            background: "linear-gradient(#00D4D9, #F6C55D)",
            boxShadow: "0 0 10px rgba(0,212,217,.4)",
          }}
        />
      ))}
    </div>
  );
}

// ================================================================
// BRAND MARK — kept as-is
// ================================================================
function BrandMark() {
  return (
    <div
      style={{
        width: 54,
        height: 65,
        color: "#B77B32",
        fontFamily: "Georgia, serif",
        fontSize: 58,
        fontStyle: "italic",
        lineHeight: 1,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          content: " ",
          position: "absolute",
          width: 47,
          height: 13,
          borderRadius: "50%",
          background: "#B77B32",
          top: 1,
          left: 5,
          transform: "rotate(-8deg)",
        }}
      />
    </div>
  );
}

const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const { has, all } = useFeatures();
  const navigate = useNavigate();
  const [planName, setPlanName] = useState(user?.planName || "Free");
  const [planLoading, setPlanLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const fetchPlanName = async () => {
      if (!user?.planId) return;
      try {
        setPlanLoading(true);
        const response = await api.get("/plans");
        if (response.data && response.data.length > 0) {
          const planIds = user.planId || [1];
          const highestPlanId = Math.max(...planIds);
          const plan = response.data.find((p) => p.planId === highestPlanId);
          if (plan) {
            setPlanName(plan.name);
          } else {
            setPlanName(user?.planName || "Free");
          }
        }
      } catch (error) {
        console.error("Failed to fetch plan name:", error);
        setPlanName(user?.planName || "Free");
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlanName();
  }, [user?.planId]);

  // ================================================================
  // NAV ITEMS — unchanged
  // ================================================================
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      path: "/trending",
      label: "Trending Ideas",
      icon: Flame,
      show: true,
    },
    {
      path: "/templates",
      label: "Mystery Templates",
      icon: LayoutGrid,
      show: true,
    },
    {
      path: "/create-mystery",
      label: "Create Mystery",
      icon: SquarePen,
      show: true,
    },
    {
      path: "/my-mysteries",
      label: "My Mysteries",
      icon: BookOpen,
      show: true,
    },
    {
      path: "/unlimited",
      icon: InfinityIcon,
      label: "Unlimited",
      show: has("unlimited"),
    },
    {
      path: "/character-studio",
      label: "Character Studio",
      icon: UsersRound,
      show: has("characterStudio"),
    },
    {
      path: "/clue-studio",
      label: "Clue & Evidence",
      icon: Search,
      show: has("clueStudio"),
    },
    {
      path: "/puzzle-studio",
      label: "AI Puzzle Studio",
      icon: PuzzleIcon,
      show: has("puzzleStudio"),
    },
    {
      path: "/escape-room-ai",
      label: "Escape Room AI",
      icon: DoorOpen,
      show: has("escapeRoom"),
    },
    {
      path: "/sales-kit",
      label: "Sales Kit",
      icon: Tag,
      show: has("salesKit"),
    },
    {
      path: "/party-planner",
      label: "Party Planner",
      icon: PartyPopper,
      show: has("partyPlanner"),
    },
    {
      path: "/dfy-packs",
      label: "DFY Mystery Packs",
      icon: Package,
      show: has("dfy"),
    },
    { path: "/agency", label: "Agency", icon: Building2, show: has("agency") },
    { path: "/reseller", label: "Reseller", icon: Gift, show: has("reseller") },
    {
      path: "/training",
      icon: GraduationCap,
      label: "Training",
      show: true,
      target: "_blank",
    },
    {
      path: "/upgrades",
      icon: Rocket,
      label: "Upgrades",
      show: true,
      target: "_blank",
      external: true,
      href: "https://www.podcastai.live/upgrades",
    },
    {
      path: "/support",
      icon: Headset,
      label: "Support",
      show: true,
      target: "_blank",
    },
  ];

  const adminNavItem = {
    path: "/admin/dashboard",
    label: "Admin Panel",
    icon: Shield,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  // ================================================================
  // PLAN BADGE — unchanged
  // ================================================================
  const getPlanColor = (planName) => {
    const planColors = {
      Free: "bg-slate-700/50 text-slate-300 border border-slate-600/50",
      FE: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
      "FE + TURBO":
        "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40",
      "Unlimited Silver":
        "bg-slate-600/40 text-slate-200 border border-slate-500/40",
      "Unlimited Gold":
        "bg-amber-500/20 text-amber-300 border border-amber-500/40",
      "Cover Design Suite":
        "bg-purple-500/20 text-purple-300 border border-purple-500/40",
      "AI Sales Machine Silver":
        "bg-purple-500/25 text-purple-200 border border-purple-500/50",
      "AI Sales Machine Gold":
        "bg-purple-500/30 text-purple-200 border border-purple-400/50",
      "DFY Silver": "bg-slate-600/40 text-slate-200 border border-slate-500/40",
      "DFY Gold":
        "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
      "AI Ranker":
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
      "AI Profit Macker Lite":
        "bg-rose-500/20 text-rose-300 border border-rose-500/40",
      "AI Profit Macker Pro":
        "bg-rose-500/25 text-rose-200 border border-rose-500/50",
      RESELLER: "bg-amber-500/25 text-amber-200 border border-amber-500/50",
    };
    return (
      planColors[planName] ||
      "bg-slate-700/50 text-slate-300 border border-slate-600/50"
    );
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      Free: "fa-box",
      FE: "fa-rocket",
      "FE + TURBO": "fa-bolt",
      "Unlimited Silver": "fa-infinity",
      "Unlimited Gold": "fa-crown",
      "Cover Design Suite": "fa-palette",
      "AI Sales Machine Silver": "fa-robot",
      "AI Sales Machine Gold": "fa-robot",
      "DFY Silver": "fa-wrench",
      "DFY Gold": "fa-wrench",
      "AI Ranker": "fa-chart-line",
      "AI Profit Macker Lite": "fa-money-bill-wave",
      "AI Profit Macker Pro": "fa-money-bill-wave",
      RESELLER: "fa-gift",
    };
    return planIcons[planName] || "fa-box";
  };

  const visibleNavItems = navItems.filter((item) => item.show);
  const isExternalLink = (item) => item.external === true;

  // ================================================================
  // THEME ALIASES
  // ================================================================
  const sidebarBg = THEME.sidebarBg;
  const sidebarBorder = THEME.sidebarBorder;
  const navDefaultText = THEME.navDefault;
  const navHoverBg = THEME.navHoverBg;
  const navActiveBg = THEME.navActiveBg;
  const navActiveShadow = "0 8px 24px rgba(246,197,93,.25)";
  const dividerColor = THEME.divider;
  const proCardBg = THEME.dropdownBg;
  const proCardBorder = THEME.dropdownBorder;

  return (
    <>
      <style>{`
        .mm-sidebar-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {/* Mobile hamburger */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl"
        style={{
          background: THEME.sidebarBg,
          border: `1px solid ${sidebarBorder}`,
          boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X size={22} style={{ color: THEME.heading }} />
        ) : (
          <Menu size={22} style={{ color: THEME.heading }} />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          hidden md:flex md:flex-col md:w-72 h-screen fixed left-0 top-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          zIndex: 10,
        }}
      >
        {/* LOGO / BRAND */}
        <div
          className="border-b flex items-center"
          style={{
            borderColor: THEME.sidebarBorder,
            padding: "15px 27px",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt="MysteryMint AI"
              style={{
                maxHeight: 80,
                maxWidth: 250,
                objectFit: "contain",
              }}
            />
          ) : (
            <>
              <BrandMark />
              <div>
                <div
                  className="mm-sidebar-serif"
                  style={{
                    fontSize: 22,
                    whiteSpace: "nowrap",
                    color: THEME.heading,
                  }}
                >
                  MysteryMint <span style={{ color: THEME.gold }}>AI</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    whiteSpace: "nowrap",
                    color: THEME.secondary,
                  }}
                >
                  AI Mystery Game Creator
                </div>
              </div>
            </>
          )}
        </div>

        {/* NAVIGATION */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: "18px 16px" }}
        >
          {/* Admin Panel */}
          {user?.role === "admin" && (
            <NavLink
              to={adminNavItem.path}
              className="flex items-center transition-colors duration-150"
              style={({ isActive }) => ({
                height: 46,
                margin: "4px 0",
                padding: "0 13px",
                gap: 14,
                borderRadius: 9,
                fontSize: 16,
                textDecoration: "none",
                background: isActive ? navActiveBg : "transparent",
                color: isActive ? THEME.navActiveText : navDefaultText,
                boxShadow: isActive ? navActiveShadow : "none",
                border: isActive
                  ? `1px solid ${THEME.navActiveBorder}`
                  : "1px solid transparent",
                fontWeight: isActive ? 700 : 500,
              })}
            >
              {({ isActive }) => (
                <>
                  <Shield size={20} strokeWidth={1.8} className="shrink-0" />
                  <span>{adminNavItem.label}</span>
                </>
              )}
            </NavLink>
          )}

          {/* Main Nav */}
          <div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              if (isExternalLink(item)) {
                return (
                  <a
                    key={item.path}
                    href={item.href}
                    target={item.target || "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center transition-colors duration-150"
                    style={{
                      height: 46,
                      margin: "4px 0",
                      padding: "0 13px",
                      gap: 14,
                      borderRadius: 9,
                      fontSize: 15,
                      color: navDefaultText,
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = navHoverBg;
                      e.currentTarget.style.color = THEME.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = navDefaultText;
                    }}
                  >
                    <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className="flex items-center transition-colors duration-150"
                  style={({ isActive }) => ({
                    height: 46,
                    margin: "4px 0",
                    padding: "0 13px",
                    gap: 14,
                    borderRadius: 9,
                    fontSize: 15,
                    textDecoration: "none",
                    background: isActive ? navActiveBg : "transparent",
                    color: isActive ? THEME.navActiveText : navDefaultText,
                    boxShadow: isActive ? navActiveShadow : "none",
                    border: isActive
                      ? `1px solid ${THEME.navActiveBorder}`
                      : "1px solid transparent",
                    fontWeight: isActive ? 700 : 500,
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = navHoverBg;
                      e.currentTarget.style.color = THEME.gold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = navDefaultText;
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* USER + DROPDOWN */}
        <div
          style={{
            padding: "0 16px 16px",
            flexShrink: 0,
            borderTop: `1px solid ${dividerColor}`,
          }}
        >
          <div
            className="relative flex items-center cursor-pointer transition"
            onClick={toggleDropdown}
            style={{
              marginTop: 12,
              padding: "6px 6px",
              borderRadius: 9,
            }}
            onMouseEnter={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = navHoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="relative shrink-0">
              <div
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{
                  width: 34,
                  height: 34,
                  background:
                    "linear-gradient(135deg, rgba(255,211,109,.35), rgba(183,123,50,.5))",
                  border: "1px solid #B77B32",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: THEME.heading,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span
                className="absolute rounded-full"
                style={{
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  background: "#00D4D9",
                  border: "2px solid #00101A",
                }}
              />
            </div>

            <div className="ml-2.5 flex-1 min-w-0">
              <div
                className="truncate"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: THEME.heading,
                }}
              >
                {user?.name || "User"}
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                {planLoading ? (
                  <span style={{ fontSize: 9, color: THEME.muted }}>
                    Loading...
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 truncate"
                    style={{ fontSize: 9, color: THEME.secondary }}
                  >
                    {planName?.replace(/^Complyzo\s+/, "") || "Free"}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              style={{
                color: THEME.secondary,
                transition: "transform .2s",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-3 right-3 rounded-xl overflow-hidden animate-slide-up z-50"
              style={{
                bottom: 80,
                background: THEME.dropdownBg,
                border: `1px solid ${proCardBorder}`,
                boxShadow: "0 20px 60px rgba(0,0,0,.55)",
              }}
            >
              <div style={{ padding: 6 }}>
                <NavLink
                  to="/settings"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = navHoverBg;
                    e.currentTarget.style.color = THEME.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = navDefaultText;
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </NavLink>

                <NavLink
                  to="/subscription"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = navHoverBg;
                    e.currentTarget.style.color = THEME.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = navDefaultText;
                  }}
                >
                  <Crown size={16} />
                  <span>Subscription</span>
                </NavLink>

                <NavLink
                  to="/support"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = navHoverBg;
                    e.currentTarget.style.color = THEME.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = navDefaultText;
                  }}
                >
                  <Headset size={16} />
                  <span>Support</span>
                </NavLink>

                <div
                  style={{
                    height: 1,
                    background: dividerColor,
                    margin: "4px 0",
                  }}
                />

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#ff8fa8",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,95,126,.12)";
                    e.currentTarget.style.color = "#ffb2c4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ff8fa8";
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: "rgba(0,16,26,.95)",
          borderTop: `1px solid ${sidebarBorder}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="flex justify-around items-center"
          style={{ padding: "6px 8px" }}
        >
          {visibleNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            if (isExternalLink(item)) {
              return (
                <a
                  key={item.path}
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                  style={{
                    padding: "6px 8px",
                    borderRadius: 12,
                    minWidth: 50,
                    color: THEME.muted,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center"
                style={({ isActive }) => ({
                  padding: "6px 8px",
                  borderRadius: 12,
                  minWidth: 50,
                  color: isActive ? THEME.navActiveText : THEME.muted,
                  background: isActive ? navActiveBg : "transparent",
                  boxShadow: isActive ? navActiveShadow : "none",
                  textDecoration: "none",
                  border: isActive
                    ? `1px solid ${THEME.navActiveBorder}`
                    : "1px solid transparent",
                })}
              >
                <Icon size={20} strokeWidth={1.8} className="shrink-0" />
              </NavLink>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px) scale(.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slide-up .2s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in .25s ease-out forwards;
        }
        aside nav::-webkit-scrollbar { width: 6px; }
        aside nav::-webkit-scrollbar-track { background: transparent; }
        aside nav::-webkit-scrollbar-thumb {
          background: rgba(246,197,93,.35);
          border-radius: 3px;
        }
        aside nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255,211,109,.6);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
