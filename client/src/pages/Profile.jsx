import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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

// ── Small helpers ─────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      {...props}
      rows={3}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition resize-none"
    />
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? "bg-rose-500" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const Alert = ({ type, msg }) => {
  if (!msg) return null;
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    error: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm ${styles[type]}`}>{msg}</div>
  );
};

const TABS = ["Profile", "Security", "Notifications", "Danger Zone"];

export default function Profile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);

  const initialTab = searchParams.get("tab") === "security" ? "Security" : "Profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // ── Profile state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", bio: "", address: "",
  });
  const [saving, setSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);

  // ── Notification prefs (client-side only)
  const [notifPrefs, setNotifPrefs] = useState({ emailAlerts: true, bookingReminders: true, promotions: false });

  // ── Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const userId = user?._id || user?.id;

  // Load profile on mount
  useEffect(() => {
    if (!token || !userId) { navigate("/login"); return; }
    authFetch(`/users/${userId}`, token)
      .then((d) => {
        if (d.success) {
          const u = d.data?.user || d.data;
          setProfileData(u);
          setForm({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            phone: u.phone || "",
            bio: u.bio || "",
            address: u.address || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [token, userId, navigate]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileAlert(null);
    try {
      const d = await authFetch(`/users/${userId}`, token, {
        method: "PUT",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      if (d.success) {
        const updated = d.data?.user || d.data;
        setProfileData(updated);
        // Update auth context so navbar reflects new name
        login({ ...user, firstName: form.firstName, lastName: form.lastName, email: form.email }, token);
        setProfileAlert({ type: "success", msg: "Profile updated successfully." });
      } else {
        setProfileAlert({ type: "error", msg: d.message || "Failed to save changes." });
      }
    } catch {
      setProfileAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const d = await authFetch(`/users/${userId}/profile-image`, token, { method: "POST", body: fd });
      if (d.success) {
        const imgUrl = d.data?.profileImage || d.data?.url;
        setProfileData((p) => ({ ...p, profileImage: imgUrl }));
        login({ ...user, profileImage: imgUrl }, token);
        setProfileAlert({ type: "success", msg: "Profile photo updated." });
      } else {
        setProfileAlert({ type: "error", msg: d.message || "Upload failed." });
      }
    } catch {
      setProfileAlert({ type: "error", msg: "Upload failed. Please try again." });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwAlert({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwAlert({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    setPwAlert(null);
    try {
      const d = await authFetch("/auth/change-password", token, {
        method: "POST",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
        headers: { "Content-Type": "application/json" },
      });
      if (d.success) {
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwAlert({ type: "success", msg: "Password changed successfully." });
      } else {
        setPwAlert({ type: "error", msg: d.message || "Failed to change password." });
      }
    } catch {
      setPwAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setPwSaving(false);
    }
  };

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User";
  const avatar = profileData?.profileImage;
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-base font-semibold text-gray-800">Account Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Avatar + name banner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center ring-4 ring-white shadow">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>{displayName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {memberSince && <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>}
          </div>
          {/* Upload button */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="text-sm font-semibold border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
            >
              {avatarLoading ? "Uploading…" : "Change Photo"}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#FF385C] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB */}
        {activeTab === "Profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5 text-base" style={{ fontFamily: "Fraunces, serif" }}>Personal Information</h3>
            {loadingProfile ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {profileAlert && <Alert type={profileAlert.type} msg={profileAlert.msg} />}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
                  <Input label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
                </div>
                <Input label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
                <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
                <Input label="Address" value={form.address} onChange={set("address")} placeholder="City, Country" />
                <Textarea label="Bio" value={form.bio} onChange={set("bio")} placeholder="Tell guests a little about yourself…" />
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#FF385C] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── SECURITY TAB */}
        {activeTab === "Security" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5 text-base" style={{ fontFamily: "Fraunces, serif" }}>Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {pwAlert && <Alert type={pwAlert.type} msg={pwAlert.msg} />}
              <Input
                label="Current Password"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat your new password"
                required
              />
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="bg-[#FF385C] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
                >
                  {pwSaving ? "Changing…" : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB */}
        {activeTab === "Notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-1 text-base" style={{ fontFamily: "Fraunces, serif" }}>Notification Preferences</h3>
            <p className="text-sm text-gray-400 mb-5">Manage how RentGo communicates with you.</p>
            <div className="divide-y divide-gray-50">
              <Toggle
                label="Email Alerts"
                desc="Receive important account and security notifications"
                checked={notifPrefs.emailAlerts}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, emailAlerts: v }))}
              />
              <Toggle
                label="Booking Reminders"
                desc="Reminders before your upcoming check-ins and check-outs"
                checked={notifPrefs.bookingReminders}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, bookingReminders: v }))}
              />
              <Toggle
                label="Promotions & Deals"
                desc="Special offers, discounts, and travel inspiration"
                checked={notifPrefs.promotions}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, promotions: v }))}
              />
            </div>
          </div>
        )}

        {/* ── DANGER ZONE TAB */}
        {activeTab === "Danger Zone" && (
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
            <h3 className="font-bold text-rose-600 mb-1 text-base">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-6">These actions are permanent and cannot be undone.</p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="border border-rose-200 text-rose-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
              >
                Delete My Account
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 max-w-md">
                <p className="text-sm font-semibold text-rose-700 mb-2">Are you absolutely sure?</p>
                <p className="text-xs text-rose-500 mb-4">
                  This will permanently delete your account, all bookings, and your listings.
                  Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteInput !== "DELETE"}
                    className="flex-1 bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={async () => {
                      try {
                        await authFetch(`/users/${userId}/deactivate`, token, { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } });
                      } catch {}
                      navigate("/login");
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
