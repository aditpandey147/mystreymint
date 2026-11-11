// frontend/src/components/ImpersonationBanner.jsx
import React, { useEffect, useState } from "react";
import { LogOut, UserCog, AlertTriangle } from "lucide-react";

const C = {
  gold: "#F6C55D",
  goldHover: "#FFD36D",
  darkGold: "#B77B32",
  mainBg: "#000C16",
  heading: "#F5F5F3",
  border: "#29414C",
};

export default function ImpersonationBanner() {
  const [impersonatedBy, setImpersonatedBy] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("impersonatedBy") || "null");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setImpersonatedBy(admin);
      setTargetUser(user);
    } catch {
      setImpersonatedBy(null);
    }
  }, []);

  if (!impersonatedBy) return null;

  const exitImpersonation = () => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUserRaw = localStorage.getItem("adminUser");

    if (adminToken) {
      // Restore admin session
      localStorage.setItem("token", adminToken);
      if (adminUserRaw) localStorage.setItem("user", adminUserRaw);
    } else {
      // Fallback: no admin token saved — just clear and redirect to admin login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("impersonatedBy");

    window.location.href = "/admin/dashboard";
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        background: `linear-gradient(90deg, ${C.darkGold}, ${C.gold}, ${C.darkGold})`,
        color: C.mainBg,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        boxShadow: "0 4px 16px rgba(0,0,0,.35)",
        borderBottom: `1px solid ${C.goldHover}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(0,12,22,.85)",
            color: C.gold,
            flexShrink: 0,
          }}
        >
          <UserCog size={16} />
        </div>
        <div style={{ minWidth: 0, lineHeight: 1.35 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={13} />
            You are logged in as{" "}
            <span
              style={{
                color: C.mainBg,
                background: "rgba(0,12,22,.9)",
                padding: "1px 6px",
                borderRadius: 4,
                color: C.gold,
                fontWeight: 700,
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
                verticalAlign: "bottom",
              }}
              title={targetUser?.email || ""}
            >
              {targetUser?.name || targetUser?.email || "User"}
            </span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
            Impersonated by {impersonatedBy.email} — session expires in 1h
          </div>
        </div>
      </div>

      <button
        onClick={exitImpersonation}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 700,
          background: C.mainBg,
          color: C.gold,
          border: `1px solid ${C.goldHover}`,
          borderRadius: 8,
          cursor: "pointer",
          transition: "all .15s ease",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#031520";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.mainBg;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <LogOut size={14} />
        Exit &amp; return to admin
      </button>
    </div>
  );
}