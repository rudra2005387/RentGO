import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authFetch = (path, token, opts = {}) =>
  fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(!opts.body || opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(opts.headers || {}),
    },
  }).then((r) => r.json());

const P  = "#FF385C";
const PD = "#E31C5F";
const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

let _fl = false;
function loadFonts() {
  if (_fl || typeof document === "undefined") return; _fl = true;
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(l);
}

const Field = ({ label, hint, type = "text", value, onChange, placeholder, disabled, rows }) => {
  const [focused, setFocused] = useState(false);
  const s = { width: "100%", border: `1.5px solid ${focused ? "#222" : "#E5E7EB"}`, borderRadius: 14, padding: "13px 16px", fontFamily: BF, fontSize: 14, color: "#111", background: disabled ? "#FAFAFA" : "#fff", outline: "none", transition: "border-color .18s", resize: rows ? "none" : undefined, lineHeight: 1.6, boxSizing: "border-box" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <label style={{ fontFamily: BF, fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</label>
        {hint && <span style={{ fontFamily: BF, fontSize: 11, color: "#bbb" }}>{hint}</span>}
      </div>
      {rows ? <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
             : <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />}
    </div>
  );
};

const PasswordStrength = ({ pw }) => {
  if (!pw) return null;
  const score = pw.length < 6 ? 1 : pw.length < 10 ? 2 : /[A-Z]/.test(pw) && /\d/.test(pw) ? 4 : 3;
  const cols = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"];
  const labs = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? cols[score] : "#E5E7EB", transition: "background .3s" }} />)}
      </div>
      <p style={{ fontFamily: BF, fontSize: 11, color: cols[score] }}>{labs[score]}</p>
    </div>
  );
};

const Toggle = ({ label, desc, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F7F7F7" }}>
    <div>
      <p style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: "#111" }}>{label}</p>
      {desc && <p style={{ fontFamily: BF, fontSize: 12, color: "#999", marginTop: 2 }}>{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)}
      style={{ position: "relative", width: 50, height: 28, borderRadius: 99, border: "none", background: checked ? P : "#E5E7EB", cursor: "pointer", transition: "background .25s", flexShrink: 0, marginLeft: 16 }}>
      <span style={{ position: "absolute", top: 4, left: checked ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.25)", transition: "left .25s" }} />
    </button>
  </div>
);

const Pill = ({ type, msg }) => {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "center", gap: 10, background: ok ? "#F0FDF4" : "#FFF1F2", border: `1px solid ${ok ? "#BBF7D0" : "#FECDD3"}`, borderRadius: 12, padding: "12px 16px" }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: ok ? "#22C55E" : "#F43F5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{ok ? "✓" : "!"}</span>
      <p style={{ fontFamily: BF, fontSize: 13, color: ok ? "#15803D" : "#BE123C" }}>{msg}</p>
    </motion.div>
  );
};

const SaveBtn = ({ saving, label = "Save Changes" }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <button type="submit" disabled={saving}
      style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: "#fff", background: saving ? "#E5E7EB" : `linear-gradient(135deg,${P},${PD})`, border: "none", borderRadius: 12, padding: "13px 28px", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 16px rgba(255,56,92,.28)", transition: "opacity .15s" }}>
      {saving ? "Saving…" : label}
    </button>
  </div>
);

const TABS = [
  { id: "Profile",       icon: "👤", label: "Profile"       },
  { id: "Security",      icon: "🔒", label: "Security"      },
  { id: "Notifications", icon: "🔔", label: "Notifications" },
  { id: "Danger Zone",   icon: "⚠️",  label: "Danger Zone"  },
];

export default function Profile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "security" ? "Security" : "Profile");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", bio: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({ emailAlerts: true, bookingReminders: true, promotions: false, messages: true });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const userId = user?._id || user?.id;
  useEffect(() => { loadFonts(); }, []);

  useEffect(() => {
    if (!token || !userId) { navigate("/login"); return; }
    authFetch(`/users/${userId}`, token)
      .then(d => { if (d.success) { const u = d.data?.user || d.data; setProfileData(u); setForm({ firstName: u.firstName || "", lastName: u.lastName || "", email: u.email || "", phone: u.phone || "", bio: u.bio || "", address: u.address || "" }); } })
      .catch(() => {}).finally(() => setLoadingProfile(false));
  }, [token, userId, navigate]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setProfileAlert(null);
    try {
      const d = await authFetch(`/users/${userId}`, token, { method: "PUT", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
      if (d.success) { setProfileData(d.data?.user || d.data); login({ ...user, firstName: form.firstName, lastName: form.lastName, email: form.email }, token); setProfileAlert({ type: "success", msg: "Profile updated successfully." }); }
      else setProfileAlert({ type: "error", msg: d.message || "Failed to save changes." });
    } catch { setProfileAlert({ type: "error", msg: "Network error. Please try again." }); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarLoading(true);
    const fd = new FormData(); fd.append("image", file);
    try {
      const d = await authFetch(`/users/${userId}/profile-image`, token, { method: "POST", body: fd });
      if (d.success) { const url = d.data?.profileImage || d.data?.url; setProfileData(p => ({ ...p, profileImage: url })); login({ ...user, profileImage: url }, token); setProfileAlert({ type: "success", msg: "Profile photo updated." }); }
      else setProfileAlert({ type: "error", msg: d.message || "Upload failed." });
    } catch { setProfileAlert({ type: "error", msg: "Upload failed. Please try again." }); }
    finally { setAvatarLoading(false); }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwAlert({ type: "error", msg: "New passwords do not match." }); return; }
    if (pwForm.newPassword.length < 6) { setPwAlert({ type: "error", msg: "Password must be at least 6 characters." }); return; }
    setPwSaving(true); setPwAlert(null);
    try {
      const d = await authFetch("/auth/change-password", token, { method: "POST", body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }), headers: { "Content-Type": "application/json" } });
      if (d.success) { setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPwAlert({ type: "success", msg: "Password changed successfully." }); }
      else setPwAlert({ type: "error", msg: d.message || "Failed to change password." });
    } catch { setPwAlert({ type: "error", msg: "Network error. Please try again." }); }
    finally { setPwSaving(false); }
  };

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User";
  const avatar = profileData?.profileImage;
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const memberSince = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F5", fontFamily: BF }}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.93)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F0F0F0", boxShadow: "0 1px 0 rgba(0,0,0,.04)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/dashboard" style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#999", textDecoration: "none" }}
            onMouseOver={e => e.currentTarget.style.color="#111"} onMouseOut={e => e.currentTarget.style.color="#999"}>← Dashboard</Link>
          <span style={{ color: "#DDD" }}>/</span>
          <span style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: "#111" }}>Account Settings</span>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Hero banner */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}
          style={{ background: "linear-gradient(135deg,#111827 0%,#1F2937 100%)", borderRadius: 24, padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 100, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,56,92,.1)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 86, height: 86, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,.18)", boxShadow: "0 8px 32px rgba(0,0,0,.35)" }}>
                {avatar ? <img src={avatar} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${P},${PD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff" }}>{initials}</div>}
              </div>
              {avatarLoading && (
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 22, height: 22, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                style={{ position: "absolute", bottom: -3, right: -3, width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "2.5px solid #111827", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>📷</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: HF, fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{displayName}</h1>
              <p style={{ fontFamily: BF, fontSize: 13, color: "rgba(255,255,255,.55)" }}>{user?.email}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
                {memberSince && <span style={{ fontFamily: BF, fontSize: 11, color: "rgba(255,255,255,.38)" }}>🗓 Member since {memberSince}</span>}
                {user?.role === "host" && <span style={{ fontFamily: BF, fontSize: 11, fontWeight: 700, color: "#FCD34D", background: "rgba(245,158,11,.14)", padding: "3px 11px", borderRadius: 99, border: "1px solid rgba(245,158,11,.28)" }}>🏅 Host</span>}
              </div>
            </div>

            <button onClick={() => fileRef.current?.click()} disabled={avatarLoading}
              style={{ flexShrink: 0, fontFamily: BF, fontSize: 13, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.11)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "10px 20px", cursor: "pointer" }}>
              {avatarLoading ? "Uploading…" : "Change Photo"}
            </button>
          </div>
        </motion.div>

        {/* Two-column */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "start" }}>

          {/* Sidebar */}
          <motion.nav initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, duration: 0.36 }}
            style={{ position: "sticky", top: 80, background: "#fff", borderRadius: 20, border: "1px solid #F0F0F0", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflow: "hidden" }}>
            {TABS.map((tab, i) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: active ? "#FFF1F2" : "transparent", border: "none", borderLeft: active ? `3px solid ${P}` : "3px solid transparent", borderBottom: i < TABS.length - 1 ? "1px solid #F7F7F7" : "none", cursor: "pointer", textAlign: "left", transition: "all .15s", fontFamily: BF, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? P : tab.id === "Danger Zone" ? "#BE123C" : "#555" }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.background = "#FAFAFA"; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ fontSize: 15 }}>{tab.icon}</span>{tab.label}
                </button>
              );
            })}
          </motion.nav>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.22 }}>

              {activeTab === "Profile" && (
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #F0F0F0", boxShadow: "0 2px 12px rgba(0,0,0,.05)", padding: "28px" }}>
                  <h2 style={{ fontFamily: HF, fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 }}>Personal Information</h2>
                  <p style={{ fontFamily: BF, fontSize: 13, color: "#999", marginBottom: 24 }}>Update your name, contact details, and bio.</p>
                  {loadingProfile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ height: 52, borderRadius: 14, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite" }} />)}
                    </div>
                  ) : (
                    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {profileAlert && <Pill type={profileAlert.type} msg={profileAlert.msg} />}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
                        <Field label="Last Name"  value={form.lastName}  onChange={set("lastName")}  placeholder="Smith" />
                      </div>
                      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
                        <Field label="Address" value={form.address} onChange={set("address")} placeholder="City, Country" />
                      </div>
                      <Field label="Bio" value={form.bio} onChange={set("bio")} placeholder="Tell guests a little about yourself…" rows={4} hint="Optional" />
                      <div style={{ height: 1, background: "#F5F5F5", margin: "4px 0" }} />
                      <SaveBtn saving={saving} />
                    </form>
                  )}
                </div>
              )}

              {activeTab === "Security" && (
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #F0F0F0", boxShadow: "0 2px 12px rgba(0,0,0,.05)", padding: "28px" }}>
                  <h2 style={{ fontFamily: HF, fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 }}>Change Password</h2>
                  <p style={{ fontFamily: BF, fontSize: 13, color: "#999", marginBottom: 24 }}>Keep your account secure with a strong, unique password.</p>
                  <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 440 }}>
                    {pwAlert && <Pill type={pwAlert.type} msg={pwAlert.msg} />}
                    <div style={{ background: "#F8F7F5", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 8 }}>Password tips</p>
                      {["At least 8 characters", "Mix uppercase & lowercase", "Include numbers & symbols"].map((t, i) => (
                        <p key={i} style={{ fontFamily: BF, fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ color: "#22C55E" }}>✓</span> {t}</p>
                      ))}
                    </div>
                    <Field label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Your current password" />
                    <div>
                      <Field label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="At least 8 characters" />
                      <PasswordStrength pw={pwForm.newPassword} />
                    </div>
                    <Field label="Confirm Password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat your new password" />
                    {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                      <p style={{ fontFamily: BF, fontSize: 12, color: "#BE123C" }}>⚠ Passwords don't match</p>
                    )}
                    <div style={{ height: 1, background: "#F5F5F5", margin: "4px 0" }} />
                    <SaveBtn saving={pwSaving} label="Change Password" />
                  </form>
                </div>
              )}

              {activeTab === "Notifications" && (
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #F0F0F0", boxShadow: "0 2px 12px rgba(0,0,0,.05)", padding: "28px" }}>
                  <h2 style={{ fontFamily: HF, fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 }}>Notification Preferences</h2>
                  <p style={{ fontFamily: BF, fontSize: 13, color: "#999", marginBottom: 20 }}>Manage how RentGo communicates with you.</p>
                  <div>
                    <Toggle label="Email Alerts"       desc="Important account and security notifications"  checked={notifPrefs.emailAlerts}       onChange={v => setNotifPrefs(p => ({ ...p, emailAlerts: v }))} />
                    <Toggle label="Booking Reminders"  desc="Reminders before your upcoming check-ins"       checked={notifPrefs.bookingReminders}  onChange={v => setNotifPrefs(p => ({ ...p, bookingReminders: v }))} />
                    <Toggle label="New Messages"       desc="When a host or guest sends you a message"       checked={notifPrefs.messages}          onChange={v => setNotifPrefs(p => ({ ...p, messages: v }))} />
                    <Toggle label="Promotions & Deals" desc="Special offers, discounts and travel ideas"     checked={notifPrefs.promotions}        onChange={v => setNotifPrefs(p => ({ ...p, promotions: v }))} />
                  </div>
                  <div style={{ marginTop: 20, background: "#F8F7F5", borderRadius: 14, padding: "14px 16px" }}>
                    <p style={{ fontFamily: BF, fontSize: 12, color: "#bbb" }}>💡 These control email notifications. In-app notifications are always delivered.</p>
                  </div>
                </div>
              )}

              {activeTab === "Danger Zone" && (
                <div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #FECDD3", boxShadow: "0 2px 12px rgba(0,0,0,.05)", padding: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>⚠️</span>
                    <h2 style={{ fontFamily: HF, fontSize: 20, fontWeight: 700, color: "#BE123C" }}>Danger Zone</h2>
                  </div>
                  <p style={{ fontFamily: BF, fontSize: 13, color: "#999", marginBottom: 28 }}>These actions are permanent and cannot be undone.</p>
                  <div style={{ background: "#FFF7F7", borderRadius: 18, padding: "22px", border: "1px solid #FECDD3" }}>
                    <p style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color: "#BE123C", marginBottom: 6 }}>Delete Account</p>
                    <p style={{ fontFamily: BF, fontSize: 13, color: "#888", marginBottom: 18, lineHeight: 1.65 }}>This will permanently delete your account, all bookings, reviews, and listings. This cannot be reversed.</p>
                    {!deleteConfirm ? (
                      <button onClick={() => setDeleteConfirm(true)}
                        style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: "#BE123C", background: "#fff", border: "1.5px solid #FECDD3", borderRadius: 12, padding: "11px 22px", cursor: "pointer" }}>Delete My Account</button>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: "#BE123C" }}>Type <strong>DELETE</strong> to confirm:</p>
                        <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE"
                          style={{ border: "1.5px solid #FECDD3", borderRadius: 12, padding: "12px 16px", fontFamily: BF, fontSize: 14, outline: "none", background: "#fff", color: "#111" }} />
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                            style={{ flex: 1, fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#555", background: "#F3F4F6", border: "none", borderRadius: 12, padding: "12px", cursor: "pointer" }}>Cancel</button>
                          <button disabled={deleteInput !== "DELETE"}
                            style={{ flex: 1, fontFamily: BF, fontSize: 13, fontWeight: 700, color: "#fff", background: deleteInput === "DELETE" ? "#BE123C" : "#E5E7EB", border: "none", borderRadius: 12, padding: "12px", cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed" }}
                            onClick={async () => { try { await authFetch(`/users/${userId}/deactivate`, token, { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } }); } catch {} navigate("/login"); }}>
                            Delete Account
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}