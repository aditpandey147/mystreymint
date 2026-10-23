// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ================================================================
// 🎨 THEME — :root palette
// ================================================================
const C = {
  mainBg: "#000C16",
  sidebar: "#00101A",
  card: "#031520",
  cardSecondary: "#0C1926",
  input: "#000611",
  textarea: "#011119",
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      className="sticky top-0 z-30"
      style={{
        background: "linear-gradient(90deg, #00101A, #000C16)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-sm font-semibold"
              style={{ color: C.heading }}
            >
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <span
              className="hidden sm:inline-block w-1 h-1 rounded-full"
              style={{ background: C.border }}
            ></span>
            <span
              className="hidden sm:inline-block text-xs"
              style={{ color: C.secondary }}
            >
              {currentTime}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.card)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: C.goldGradient,
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: C.mainBg }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: C.secondary }}
                ></i>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg overflow-hidden z-50"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 20px 60px rgba(0,0,0,.55)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: C.heading }}
                    >
                      {user?.name}
                    </p>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: C.secondary }}
                    >
                      {user?.email}
                    </p>
                    <span
                      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5"
                      style={
                        user?.planName && user?.planName !== 'Free'
                          ? {
                              background: "rgba(246,197,93,.18)",
                              color: C.goldHover,
                              border: `1px solid ${C.gold}`,
                            }
                          : {
                              background: "rgba(170,179,185,.18)",
                              color: C.secondary,
                              border: `1px solid ${C.border}`,
                            }
                      }
                    >
                      {user?.planName || 'Free'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: C.heading, background: "transparent" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.cardSecondary;
                        e.currentTarget.style.color = C.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = C.heading;
                      }}
                    >
                      <i
                        className="fa-solid fa-gear text-xs w-4"
                        style={{ color: C.gold }}
                      ></i>
                      Settings
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => { navigate('/admin/dashboard'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: C.heading, background: "transparent" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.cardSecondary;
                          e.currentTarget.style.color = C.gold;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = C.heading;
                        }}
                      >
                        <i
                          className="fa-solid fa-shield text-xs w-4"
                          style={{ color: "#ff8fa8" }}
                        ></i>
                        Admin Panel
                      </button>
                    )}
                  </div>

                  <div
                    className="py-1"
                    style={{ borderTop: `1px solid ${C.border}` }}
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "#ff8fa8", background: "transparent" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,95,126,.12)";
                        e.currentTarget.style.color = "#ffb2c4";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#ff8fa8";
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4"></i>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;