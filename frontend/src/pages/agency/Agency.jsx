// frontend/src/pages/Agency.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Crown,
  Trash2,
  Check,
  X,
  Loader2,
  UserCheck,
  UserX,
  Mail,
  Key,
  Building2,
  Sparkles,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
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

export default function Agency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [members, setMembers] = useState([]);
  const [isAgency, setIsAgency] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/agency/members");
      setMembers(res.data?.members || []);
      setAgencyName(res.data?.agencyName || "");
      setIsAgency(true);
    } catch (err) {
      console.error("Failed to load members:", err);
      if (err.response?.status === 403) {
        setIsAgency(false);
      } else {
        toast.error("Failed to load agency");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setAdding(true);
    try {
      await api.post("/agency/members", addForm);
      toast.success(`Member "${addForm.name}" added!`);
      setAddForm({ name: "", email: "", password: "" });
      setShowAddForm(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (member) => {
    try {
      const res = await api.patch(`/agency/members/${member._id}/toggle`);
      toast.success(res.data?.message || "Updated");
      fetchMembers();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/agency/members/${deleteTarget._id}`);
      toast.success("Member removed");
      setDeleteTarget(null);
      fetchMembers();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  // Not an agency owner
  if (!loading && !isAgency) {
    return (
      <div className="flex h-screen" style={{ background: C.mainBg }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div
              className="text-center max-w-md p-8 rounded-2xl"
              style={{
                background: C.card,
                border: `1px solid ${C.gold}55`,
                boxShadow: "0 20px 60px rgba(0,0,0,.4)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-5"
                style={{
                  background: "rgba(246,197,93,.12)",
                  border: `1px solid ${C.gold}55`,
                }}
              >
                <Building2 size={28} style={{ color: C.gold }} />
              </div>
              <h2
                className="font-['Playfair_Display',Georgia,serif] text-2xl font-bold mb-2"
                style={{ color: C.heading }}
              >
                Agency Plan Required
              </h2>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: C.secondary }}
              >
                Agency (Plan 8) lets you add team members — everyone shares your
                subscription. Upgrade to unlock.
              </p>
              <button
                onClick={() => navigate("/upgrades")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-[1px]"
                style={{
                  background: C.goldGradient,
                  color: C.mainBg,
                  border: `1px solid ${C.goldHover}`,
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
                }}
              >
                <Crown size={16} />
                Upgrade to Agency
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: C.mainBg }}>
      <Sidebar />
      <div
        className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen"
        style={{ background: C.mainBg }}
      >
        <Navbar />

        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1
                className="font-['Playfair_Display',Georgia,serif] text-2xl font-bold flex items-center gap-2.5"
                style={{ color: C.heading }}
              >
                <Building2 size={24} style={{ color: C.gold }} />
                {agencyName || "Your Agency"}
              </h1>
              <p className="text-sm mt-1" style={{ color: C.secondary }}>
                Manage members and share your subscription with your team.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-[1px]"
              style={{
                background: C.goldGradient,
                color: C.mainBg,
                border: `1px solid ${C.goldHover}`,
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(246,197,93,.35)",
              }}
            >
              <UserPlus size={15} />
              Add Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Members" value={members.length} color={C.cyan} icon={Users} />
            <StatCard
              label="Active"
              value={members.filter((m) => m.isActive !== false).length}
              color="#0ce4bd"
              icon={UserCheck}
            />
            <StatCard
              label="Disabled"
              value={members.filter((m) => m.isActive === false).length}
              color={C.rose}
              icon={UserX}
            />
            <StatCard label="Shared Plan" value="Agency" color={C.gold} icon={Crown} />
          </div>

          {/* Add member form */}
          {showAddForm && (
            <div
              className="rounded-2xl p-5 mb-6"
              style={{
                background: C.card,
                border: `1px solid ${C.gold}55`,
                boxShadow: "0 12px 40px rgba(0,0,0,.4)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center"
                    style={{
                      background: "rgba(246,197,93,.15)",
                      border: `1px solid ${C.gold}55`,
                    }}
                  >
                    <UserPlus size={14} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <div
                      className="text-[14px] font-semibold"
                      style={{ color: C.heading }}
                    >
                      Add New Member
                    </div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: C.secondary }}
                    >
                      They'll share your subscription automatically.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm({ name: "", email: "", password: "" });
                  }}
                  className="w-8 h-8 rounded-full grid place-items-center transition"
                  style={{ color: C.secondary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(246,197,93,.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMember}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label
                      className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: C.secondary }}
                    >
                      Name
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: C.input,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Users size={14} style={{ color: C.muted }} />
                      <input
                        type="text"
                        value={addForm.name}
                        onChange={(e) =>
                          setAddForm({ ...addForm, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="flex-1 bg-transparent outline-none text-[13px]"
                        style={{ color: C.heading }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: C.secondary }}
                    >
                      Email
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: C.input,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Mail size={14} style={{ color: C.muted }} />
                      <input
                        type="email"
                        value={addForm.email}
                        onChange={(e) =>
                          setAddForm({ ...addForm, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="flex-1 bg-transparent outline-none text-[13px]"
                        style={{ color: C.heading }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: C.secondary }}
                    >
                      Password
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: C.input,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <Key size={14} style={{ color: C.muted }} />
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) =>
                          setAddForm({ ...addForm, password: e.target.value })
                        }
                        placeholder="Min 6 chars"
                        className="flex-1 bg-transparent outline-none text-[13px]"
                        style={{ color: C.heading }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddForm({ name: "", email: "", password: "" });
                    }}
                    className="h-[42px] px-5 rounded-[10px] text-[13px] font-medium transition"
                    style={{
                      background: C.input,
                      border: `1px solid ${C.border}`,
                      color: C.secondary,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="h-[42px] px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition hover:-translate-y-[1px] disabled:opacity-60 disabled:translate-y-0"
                    style={{
                      background: C.goldGradient,
                      color: C.mainBg,
                      border: `1px solid ${C.goldHover}`,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,.25), 0 4px 14px rgba(246,197,93,.35)",
                    }}
                  >
                    {adding ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members list */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="grid grid-cols-12 gap-3 px-5 py-3 text-[10.5px] font-semibold tracking-[0.5px] uppercase"
              style={{
                background: C.cardSecondary,
                borderBottom: `1px solid ${C.border}`,
                color: C.secondary,
              }}
            >
              <div className="col-span-4">Member</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Joined</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2
                  size={28}
                  className="animate-spin mx-auto mb-3"
                  style={{ color: C.gold }}
                />
                <p className="text-[13px]" style={{ color: C.secondary }}>
                  Loading members…
                </p>
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-3"
                  style={{
                    background: "rgba(246,197,93,.1)",
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  <Users size={22} style={{ color: C.gold }} />
                </div>
                <p
                  className="text-[14px] font-medium"
                  style={{ color: C.heading }}
                >
                  No members yet
                </p>
                <p
                  className="text-[12px] mt-1 max-w-[340px] mx-auto"
                  style={{ color: C.secondary }}
                >
                  Add your first team member — they'll get instant access to
                  your plan.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 h-[38px] px-5 rounded-[10px] text-[12.5px] font-bold inline-flex items-center gap-2 transition hover:-translate-y-[1px]"
                  style={{
                    background: C.goldGradient,
                    color: C.mainBg,
                    border: `1px solid ${C.goldHover}`,
                  }}
                >
                  <UserPlus size={14} />
                  Add First Member
                </button>
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m._id}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center"
                  style={{
                    borderBottom: `1px solid rgba(41,65,76,.6)`,
                  }}
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full grid place-items-center shrink-0 text-[13px] font-bold"
                      style={{
                        background: "rgba(246,197,93,.15)",
                        border: `1px solid ${C.gold}55`,
                        color: C.gold,
                      }}
                    >
                      {m.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[13px] font-semibold truncate"
                        style={{ color: C.heading }}
                      >
                        {m.name}
                      </div>
                      <div
                        className="text-[11px] truncate"
                        style={{ color: C.secondary }}
                      >
                        {m.email}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                      style={{
                        background: "rgba(246,197,93,.12)",
                        border: `1px solid ${C.gold}45`,
                        color: C.gold,
                      }}
                    >
                      <Users size={10} />
                      Agency Member
                    </span>
                  </div>

                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => handleToggle(m)}
                      className="text-[10.5px] px-2.5 py-1 rounded-full font-semibold transition"
                      style={
                        m.isActive !== false
                          ? {
                              background: "rgba(12,228,189,.15)",
                              border: "1px solid rgba(12,228,189,.35)",
                              color: "#0ce4bd",
                            }
                          : {
                              background: "rgba(255,95,126,.15)",
                              border: "1px solid rgba(255,95,126,.35)",
                              color: C.rose,
                            }
                      }
                    >
                      {m.isActive !== false ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <div
                    className="col-span-2 text-center text-[11px]"
                    style={{ color: C.secondary }}
                  >
                    {new Date(m.createdAt).toLocaleDateString()}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="w-7 h-7 rounded-[7px] grid place-items-center transition"
                      style={{
                        background: "rgba(255,95,126,.1)",
                        border: "1px solid rgba(255,95,126,.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,95,126,.2)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,95,126,.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,95,126,.1)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,95,126,.3)";
                      }}
                      title="Remove member"
                    >
                      <Trash2 size={12} style={{ color: C.rose }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info footer */}
          <div
            className="mt-5 rounded-xl p-4 flex items-start gap-3"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            <Sparkles
              size={14}
              style={{ color: C.gold, marginTop: 2, flexShrink: 0 }}
            />
            <div
              className="text-[12px] leading-[1.55]"
              style={{ color: C.secondary }}
            >
              <b style={{ color: C.heading }}>How Agency works:</b> Members you
              add here can log in with their email/password and get full access
              to everything in your current plan. All usage counts toward your
              subscription — no separate billing.
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,12,22,.85)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl max-w-md w-full p-6"
            style={{
              background: C.card,
              border: `1px solid rgba(255,95,126,.4)`,
              boxShadow: "0 30px 100px rgba(0,0,0,.8)",
            }}
          >
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4"
                style={{
                  background: "rgba(255,95,126,.15)",
                  border: "1px solid rgba(255,95,126,.35)",
                }}
              >
                <Trash2 size={24} style={{ color: C.rose }} />
              </div>
              <h3
                className="font-['Playfair_Display',Georgia,serif] text-lg font-bold"
                style={{ color: C.heading }}
              >
                Remove Member?
              </h3>
              <p
                className="text-sm mt-2 leading-relaxed"
                style={{ color: C.secondary }}
              >
                <b style={{ color: C.heading }}>{deleteTarget.name}</b> (
                {deleteTarget.email}) will lose access to your agency immediately.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  color: C.secondary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition hover:-translate-y-[1px] disabled:opacity-60 disabled:translate-y-0"
                style={{
                  background: `linear-gradient(115deg, ${C.rose}, #ff5f7e)`,
                  color: "#0b0208",
                  border: `1px solid ${C.rose}`,
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 22px rgba(255,95,126,.3)",
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Removing…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// STAT CARD
// ================================================================
function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,.03) inset",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="w-8 h-8 rounded-lg grid place-items-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon size={14} style={{ color }} />
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div
        className="text-[11.5px] font-medium mt-0.5"
        style={{ color: C.secondary }}
      >
        {label}
      </div>
    </div>
  );
}