import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReviewForm from "../components/ReviewForm";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../config/apiClient";

const authFetch = async (path, token) => {
  const response = await apiClient.get(path);
  return response.data;
};

/* ── Design tokens ── */
const P = "#FF385C";
const PD = "#E31C5F";

/* ── Fonts ── */
let _fonts = false;
function loadFonts() {
  if (_fonts || typeof document === "undefined") return;
  _fonts = true;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(l);
}

const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

/* ── Status helpers ── */
const STATUS_CFG = {
  confirmed: { bg: "#DCFCE7", fg: "#15803D", dot: "#22C55E", label: "Confirmed" },
  pending:   { bg: "#FEF9C3", fg: "#A16207", dot: "#EAB308", label: "Pending" },
  cancelled: { bg: "#FFE4E6", fg: "#BE123C", dot: "#F43F5E", label: "Cancelled" },
  completed: { bg: "#DBEAFE", fg: "#1D4ED8", dot: "#3B82F6", label: "Completed" },
};
const getStatus = (s) => STATUS_CFG[s?.toLowerCase()] || { bg: "#F3F4F6", fg: "#6B7280", dot: "#9CA3AF", label: s || "Unknown" };

/* ── Skeleton pulse ── */
const Shimmer = ({ w = "100%", h = 16, r = 8, style = {} }) => (
  <div
    style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
      ...style,
    }}
  />
);

/* ── Avatar ── */
const Avatar = ({ name = "", image, size = 40 }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  return image ? (
    <img
      src={image} alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #fff", boxShadow: "0 0 0 1px #e5e7eb" }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${P}, ${PD})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: BF, fontWeight: 700,
      fontSize: size * 0.35, border: "2.5px solid #fff", boxShadow: "0 0 0 1px #e5e7eb",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, emoji, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: "#fff",
      borderRadius: 20,
      padding: "20px 22px",
      border: "1px solid #F0F0F0",
      boxShadow: "0 2px 12px rgba(0,0,0,.06)",
      position: "relative",
      overflow: "hidden",
      fontFamily: BF,
    }}
  >
    <div style={{
      position: "absolute", top: -20, right: -20,
      width: 80, height: 80, borderRadius: "50%",
      background: gradient, opacity: 0.12,
    }} />
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      background: gradient, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: 20, marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,.12)",
    }}>
      {emoji}
    </div>
    <p style={{ fontSize: 26, fontWeight: 700, color: "#111", fontFamily: HF, lineHeight: 1 }}>{value ?? "—"}</p>
    <p style={{ fontSize: 13, color: "#888", marginTop: 4, fontWeight: 500 }}>{label}</p>
    {sub && <p style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>{sub}</p>}
  </motion.div>
);

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.fg,
      fontSize: 11, fontWeight: 700, fontFamily: BF,
      padding: "4px 10px", borderRadius: 99,
      textTransform: "capitalize", letterSpacing: ".02em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

/* ── Booking Card ── */
const BookingCard = ({ booking, delay = 0 }) => {
  const listing = booking.listing || {};
  const img = listing.images?.[0]?.url;
  const title = listing.title || "Property";
  const city = listing.location?.city || "";
  const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const total = booking.pricing?.total;
  const ref = booking.bookingReference || booking._id?.slice(-8).toUpperCase();
  const nights = booking.pricing?.nights ||
    (booking.checkInDate && booking.checkOutDate
      ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000)
      : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Link
        to={`/booking/${booking._id}`}
        style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", textDecoration: "none", transition: "background .15s", borderRadius: 0 }}
        onMouseOver={e => e.currentTarget.style.background = "#FAFAFA"}
        onMouseOut={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Thumbnail */}
        <div style={{ width: 60, height: 60, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#F3F4F6" }}>
          {img
            ? <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#FFE4E6,#FEF9C3)", fontSize: 24 }}>🏠</div>
          }
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: BF, fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
          <p style={{ fontFamily: BF, fontSize: 12, color: "#888" }}>{city}</p>
          <p style={{ fontFamily: BF, fontSize: 11, color: "#bbb", marginTop: 2 }}>
            {checkIn} → {checkOut}{nights ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        {/* Right */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <StatusBadge status={booking.status} />
          {total && <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: "#111", marginTop: 6 }}>${Number(total).toLocaleString()}</p>}
          <p style={{ fontFamily: BF, fontSize: 10, color: "#ccc", marginTop: 2 }}>#{ref}</p>
        </div>
      </Link>
    </motion.div>
  );
};

/* ── Wishlist Card ── */
const WishlistCard = ({ item }) => {
  const img = item.images?.[0]?.url;
  const price = item.pricing?.basePrice;
  return (
    <Link to={`/listing/${item._id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <div style={{ width: 160 }}>
        <div style={{ width: 160, height: 120, borderRadius: 14, overflow: "hidden", background: "#F3F4F6", marginBottom: 8 }}>
          {img
            ? <img src={img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#FFE4E6,#FDE8D8)", fontSize: 30 }}>🏡</div>
          }
        </div>
        <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
        <p style={{ fontFamily: BF, fontSize: 11, color: "#888" }}>{item.location?.city}</p>
        {price && <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, marginTop: 2 }}>${price}<span style={{ fontWeight: 400, color: "#aaa" }}>/night</span></p>}
      </div>
    </Link>
  );
};

/* ── Review Card ── */
const ReviewCard = ({ review, i }) => {
  const author = review.author || {};
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ") || "Guest";
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const rating = review.overallRating || review.rating || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      style={{ background: "#FAFAFA", borderRadius: 16, padding: 18, border: "1px solid #F0F0F0" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar name={name} image={author.profileImage} size={36} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: BF, fontWeight: 600, fontSize: 13, color: "#111" }}>{name}</p>
          <p style={{ fontFamily: BF, fontSize: 11, color: "#bbb" }}>{date}</p>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, j) => (
            <span key={j} style={{ fontSize: 12, color: j < rating ? "#F59E0B" : "#E5E7EB" }}>★</span>
          ))}
        </div>
      </div>
      {review.comment && (
        <p style={{ fontFamily: BF, fontSize: 13, color: "#555", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {review.comment}
        </p>
      )}
    </motion.div>
  );
};

/* ── Section wrapper ── */
const Section = ({ title, action, actionLabel, emoji, children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #F0F0F0", boxShadow: "0 2px 16px rgba(0,0,0,.05)", overflow: "hidden", ...style }}>
    {(title || action) && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 16px", borderBottom: "1px solid #F7F7F7" }}>
        <h2 style={{ fontFamily: HF, fontSize: 17, fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
          {emoji && <span>{emoji}</span>}{title}
        </h2>
        {action && (
          <button onClick={action} style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>
            {actionLabel}
          </button>
        )}
      </div>
    )}
    {children}
  </div>
);

const TABS = ["Overview", "My Bookings", "Saved / Wishlist", "Reviews", "Quick Actions"];

/* ════════ MAIN ════════ */
export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [pendingReviewPrompt, setPendingReviewPrompt] = useState(null);
  const [loading, setLoading] = useState({ bookings: true, wishlist: true, reviews: true, stats: true, profile: true });
  const setLoaded = (key) => setLoading((p) => ({ ...p, [key]: false }));
  const userId = user?._id || user?.id;

  useEffect(() => { loadFonts(); }, []);

  const fetchAll = useCallback(async () => {
    if (!token || !userId) return;
    authFetch(`/users/${userId}`, token).then((d) => { if (d.success) setProfile(d.data?.user); }).catch(() => {}).finally(() => setLoaded("profile"));
    authFetch(`/users/${userId}/stats`, token).then((d) => { if (d.success) setStats(d.data?.stats); }).catch(() => {}).finally(() => setLoaded("stats"));
    authFetch(`/bookings?role=guest&limit=20`, token).then((d) => { if (d.success) setBookings(d.data?.bookings || []); }).catch(() => {}).finally(() => setLoaded("bookings"));
    authFetch(`/users/${userId}/wishlist?limit=12`, token).then((d) => { if (d.success) setWishlist(d.data?.wishlist || []); }).catch(() => {}).finally(() => setLoaded("wishlist"));
    authFetch(`/users/${userId}/reviews?limit=10`, token).then((d) => { if (d.success) setReviews(d.data?.reviews || []); }).catch(() => {}).finally(() => setLoaded("reviews"));
  }, [token, userId]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, [fetchAll, token, navigate]);

  const upcomingBookings = bookings.filter((b) => ["confirmed", "pending"].includes(b.status?.toLowerCase()));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status?.toLowerCase()));
  const pendingGuestReviews = bookings.filter((b) => b.status?.toLowerCase() === 'completed' && !b.guestReview);
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User";
  const isHost = user?.role === "host";
  const totalSpent = bookings.filter((b) => b.status?.toLowerCase() === "completed").reduce((acc, b) => acc + (b.pricing?.total || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!pendingGuestReviews.length) return;
    const first = pendingGuestReviews[0];
    const storageKey = `rg_review_prompted_${first._id}`;
    if (localStorage.getItem(storageKey)) return;
    setPendingReviewPrompt(first);
  }, [pendingGuestReviews]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F5", fontFamily: BF }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #F0F0F0",
        boxShadow: "0 1px 0 rgba(0,0,0,.04)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: P, textDecoration: "none" }}>RentGo</Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link to="/" style={{ fontFamily: BF, fontSize: 13, fontWeight: 500, color: "#666", textDecoration: "none" }}>Home</Link>
            <Link to="/search" style={{ fontFamily: BF, fontSize: 13, fontWeight: 500, color: "#666", textDecoration: "none" }}>Explore</Link>
            {isHost && <Link to="/create-listing" style={{ fontFamily: BF, fontSize: 13, fontWeight: 500, color: "#666", textDecoration: "none" }}>My Listings</Link>}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={displayName} image={profile?.profileImage} size={38} />
            <div>
              <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>{user?.firstName || displayName}</p>
              <p style={{ fontFamily: BF, fontSize: 11, color: "#bbb" }}>{user?.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              style={{ marginLeft: 8, fontFamily: BF, fontSize: 12, fontWeight: 600, color: "#888", background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all .15s" }}
              onMouseOver={e => { e.currentTarget.style.color = P; e.currentTarget.style.borderColor = P; }}
              onMouseOut={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}
        >
          <div>
            <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              {greeting} ☀️
            </p>
            <h1 style={{ fontFamily: HF, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#111", lineHeight: 1.15 }}>
              Welcome back, {user?.firstName || "there"} 👋
            </h1>
            <p style={{ fontFamily: BF, fontSize: 14, color: "#888", marginTop: 6 }}>
              Here's everything happening with your account
            </p>
          </div>
          {isHost && (
            <Link
              to="/create-listing"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: `linear-gradient(135deg, ${P}, ${PD})`,
                color: "#fff", fontFamily: BF, fontWeight: 700, fontSize: 13,
                padding: "12px 20px", borderRadius: 99, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(255,56,92,.3)", flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              + New Listing
            </Link>
          )}
        </motion.div>

        {/* ── Tab Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            display: "flex", gap: 4, background: "#fff",
            borderRadius: 18, padding: 6,
            border: "1px solid #F0F0F0",
            boxShadow: "0 2px 12px rgba(0,0,0,.05)",
            marginBottom: 28,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                padding: "9px 18px",
                borderRadius: 12,
                border: "none",
                fontFamily: BF,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
                background: activeTab === tab ? `linear-gradient(135deg, ${P}, ${PD})` : "transparent",
                color: activeTab === tab ? "#fff" : "#888",
                boxShadow: activeTab === tab ? "0 4px 12px rgba(255,56,92,.25)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* ═══ OVERVIEW ═══ */}
        <AnimatePresence mode="wait">
          {pendingReviewPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)',
                border: '1px solid #FECDD3',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontFamily: BF, fontWeight: 700, fontSize: 14, color: '#111' }}>Rate your stay</p>
                <p style={{ fontFamily: BF, fontSize: 12, color: '#555' }}>
                  {pendingReviewPrompt.listing?.title || 'Your stay'} is completed. Share ratings for cleanliness, communication, location, and value.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    localStorage.setItem(`rg_review_prompted_${pendingReviewPrompt._id}`, '1');
                    setPendingReviewPrompt(null);
                  }}
                  style={{
                    border: '1px solid #ddd',
                    background: '#fff',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontFamily: BF,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Later
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`rg_review_prompted_${pendingReviewPrompt._id}`, '1');
                    setReviewBookingId(pendingReviewPrompt._id);
                    setPendingReviewPrompt(null);
                  }}
                  style={{
                    border: 'none',
                    background: '#FF385C',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '8px 12px',
                    fontFamily: BF,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Review now
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "Overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {loading.bookings ? (
                  [0,1,2,3].map(i => <Shimmer key={i} h={110} r={20} />)
                ) : (
                  <>
                    <StatCard label="Upcoming Trips" value={upcomingBookings.length} emoji="✈️" gradient="linear-gradient(135deg,#BAE6FD,#60A5FA)" sub="Active bookings" delay={0} />
                    <StatCard label="Past Trips" value={pastBookings.length} emoji="🏁" gradient="linear-gradient(135deg,#BBF7D0,#34D399)" sub="Completed stays" delay={0.06} />
                    <StatCard label="Saved Places" value={wishlist.length} emoji="❤️" gradient={`linear-gradient(135deg,#FECDD3,${P})`} sub="In wishlist" delay={0.12} />
                    <StatCard label="Total Spent" value={`$${totalSpent.toLocaleString()}`} emoji="💳" gradient="linear-gradient(135deg,#DDD6FE,#8B5CF6)" sub="All time" delay={0.18} />
                  </>
                )}
              </div>

              {/* Host stats */}
              {isHost && stats && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  style={{ background: "linear-gradient(135deg,#111827,#1F2937)", borderRadius: 24, padding: "24px 28px", marginBottom: 24, border: "1px solid #374151" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h2 style={{ fontFamily: HF, fontSize: 18, fontWeight: 600, color: "#fff" }}>Host Dashboard</h2>
                    {stats.superhost && (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,.15)", color: "#FCD34D", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(245,158,11,.25)" }}>
                        🏅 Superhost
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                    {[
                      { label: "Listings", val: stats.totalListings ?? 0 },
                      { label: "Bookings", val: stats.completedBookings ?? 0 },
                      { label: "Earnings", val: `$${(stats.totalEarnings ?? 0).toLocaleString()}` },
                      { label: "Avg Rating", val: `${stats.averageRating?.toFixed(1) ?? "—"} ⭐` },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <p style={{ fontFamily: HF, fontSize: 28, fontWeight: 700, color: "#fff" }}>{s.val}</p>
                        <p style={{ fontFamily: BF, fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recent Bookings */}
              <Section title="Recent Bookings" emoji="📋" action={() => setActiveTab("My Bookings")} actionLabel="View all →" style={{ marginBottom: 20 }}>
                {loading.bookings ? (
                  <div style={{ padding: 20 }}>
                    {[0,1,2].map(i => <Shimmer key={i} h={72} r={12} style={{ marginBottom: 10 }} />)}
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>🧳</p>
                    <p style={{ fontFamily: BF, fontWeight: 600, color: "#555", marginBottom: 4 }}>No bookings yet</p>
                    <Link to="/search" style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: P, textDecoration: "underline" }}>Explore homes →</Link>
                  </div>
                ) : (
                  <div style={{ borderTop: "1px solid #F7F7F7" }}>
                    {bookings.slice(0, 4).map((b, i) => (
                      <div key={b._id} style={{ borderBottom: i < Math.min(3, bookings.length - 1) ? "1px solid #F7F7F7" : "none" }}>
                        <BookingCard booking={b} delay={i * 0.05} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Wishlist preview */}
              {wishlist.length > 0 && (
                <Section title="Saved Places" emoji="❤️" action={() => setActiveTab("Saved / Wishlist")} actionLabel="View all →">
                  <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "16px 20px 20px" }}>
                    {wishlist.slice(0, 8).map((item) => <WishlistCard key={item._id} item={item} />)}
                  </div>
                </Section>
              )}
            </motion.div>
          )}

          {/* ═══ MY BOOKINGS ═══ */}
          {activeTab === "My Bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Section title="Upcoming Trips" emoji="✈️">
                {loading.bookings ? (
                  <div style={{ padding: 20 }}>{[0,1,2].map(i => <Shimmer key={i} h={72} r={12} style={{ marginBottom: 10 }} />)}</div>
                ) : upcomingBookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>🗓️</p>
                    <p style={{ fontFamily: BF, fontWeight: 600, color: "#555", marginBottom: 4 }}>No upcoming trips</p>
                    <Link to="/search" style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: P, textDecoration: "underline" }}>Find your next stay →</Link>
                  </div>
                ) : (
                  <div style={{ borderTop: "1px solid #F7F7F7" }}>
                    {upcomingBookings.map((b, i) => (
                      <div key={b._id} style={{ borderBottom: i < upcomingBookings.length - 1 ? "1px solid #F7F7F7" : "none" }}>
                        <BookingCard booking={b} delay={i * 0.05} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Past & Cancelled" emoji="🏁">
                {loading.bookings ? (
                  <div style={{ padding: 20 }}>{[0,1].map(i => <Shimmer key={i} h={72} r={12} style={{ marginBottom: 10 }} />)}</div>
                ) : pastBookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                    <p style={{ fontFamily: BF, fontWeight: 600, color: "#555" }}>No past bookings</p>
                  </div>
                ) : (
                  <div style={{ borderTop: "1px solid #F7F7F7" }}>
                    {pastBookings.map((b, i) => (
                      <div key={b._id} style={{ borderBottom: i < pastBookings.length - 1 ? "1px solid #F7F7F7" : "none" }}>
                        <BookingCard booking={b} delay={i * 0.05} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </motion.div>
          )}

          {/* ═══ WISHLIST ═══ */}
          {activeTab === "Saved / Wishlist" && (
            <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Section title="Saved Places" emoji="❤️">
                {loading.wishlist ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: 20 }}>
                    {[0,1,2,3,4,5,6,7].map(i => <Shimmer key={i} h={160} r={14} />)}
                  </div>
                ) : wishlist.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 20px" }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}>🤍</p>
                    <p style={{ fontFamily: BF, fontWeight: 600, color: "#555", marginBottom: 4 }}>No saved places yet</p>
                    <Link to="/search" style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: P, textDecoration: "underline" }}>Explore and save homes →</Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, padding: 20 }}>
                    {wishlist.map((item) => (
                      <Link key={item._id} to={`/listing/${item._id}`} style={{ textDecoration: "none" }}>
                        <div>
                          <div style={{ borderRadius: 16, overflow: "hidden", background: "#F3F4F6", aspectRatio: "1", marginBottom: 10 }}>
                            {item.images?.[0]?.url
                              ? <img src={item.images[0].url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s" }}
                                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏡</div>
                            }
                          </div>
                          <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                          <p style={{ fontFamily: BF, fontSize: 12, color: "#888" }}>{item.location?.city}</p>
                          {item.pricing?.basePrice && <p style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: P, marginTop: 2 }}>${item.pricing.basePrice}<span style={{ fontWeight: 400, color: "#aaa", fontSize: 11 }}>/night</span></p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Section>
            </motion.div>
          )}

          {/* ═══ REVIEWS ═══ */}
          {activeTab === "Reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {pastBookings.filter((b) => b.status?.toLowerCase() === "completed").length > 0 && (
                <Section title="Leave a Review" emoji="✍️">
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {pastBookings.filter((b) => b.status?.toLowerCase() === "completed").slice(0, 5).map((b) => (
                      <div key={b._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", borderRadius: 14, border: "1px solid #F0F0F0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          {b.listing?.images?.[0]?.url && (
                            <img src={b.listing.images[0].url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: BF, fontWeight: 600, fontSize: 13, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.listing?.title || "Listing"}</p>
                            <p style={{ fontFamily: BF, fontSize: 11, color: "#888" }}>{b.listing?.location?.city}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setReviewBookingId(b._id)}
                          style={{ flexShrink: 0, fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, border: `1.5px solid ${P}`, background: "none", padding: "8px 16px", borderRadius: 10, cursor: "pointer", transition: "background .15s" }}
                          onMouseOver={e => e.currentTarget.style.background = "#FFF1F2"}
                          onMouseOut={e => e.currentTarget.style.background = "none"}
                        >
                          Write Review
                        </button>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Reviews About You" emoji="⭐">
                {loading.reviews ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 20 }}>
                    {[0,1,2,3].map(i => <Shimmer key={i} h={110} r={14} />)}
                  </div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 20px" }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}>💬</p>
                    <p style={{ fontFamily: BF, fontWeight: 600, color: "#555" }}>No reviews yet</p>
                    <p style={{ fontFamily: BF, fontSize: 12, color: "#aaa", marginTop: 4 }}>Reviews appear here after completed stays</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 20 }}>
                    {reviews.map((r, i) => <ReviewCard key={r._id || i} review={r} i={i} />)}
                  </div>
                )}
              </Section>

              {reviewBookingId && (
                <ReviewForm bookingId={reviewBookingId} token={token} onClose={() => setReviewBookingId(null)} onSubmitted={() => fetchAll()} />
              )}
            </motion.div>
          )}

          {/* ═══ QUICK ACTIONS ═══ */}
          {activeTab === "Quick Actions" && (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { emoji: "🔍", label: "Explore Homes", desc: "Find your next getaway", to: "/search", gradient: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "#BFDBFE", hover: "#2563EB" },
                  { emoji: "👤", label: "Edit Profile", desc: "Update your info & photo", to: "/profile", gradient: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", border: "#DDD6FE", hover: "#7C3AED" },
                  { emoji: "🔒", label: "Change Password", desc: "Keep your account secure", to: "/profile?tab=security", gradient: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "#FDE68A", hover: "#D97706" },
                  { emoji: "📋", label: "All Bookings", desc: "View your full history", action: () => setActiveTab("My Bookings"), gradient: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "#A7F3D0", hover: "#059669" },
                  ...(isHost
                    ? [
                        { emoji: "🏠", label: "Create Listing", desc: "List a new property", to: "/create-listing", gradient: `linear-gradient(135deg,#FFF1F2,#FFE4E6)`, border: "#FECDD3", hover: P },
                        { emoji: "📊", label: "Host Dashboard", desc: "Manage your listings", to: "/hosting", gradient: "linear-gradient(135deg,#FFF7ED,#FFEDD5)", border: "#FED7AA", hover: "#EA580C" },
                      ]
                    : [
                        { emoji: "🏡", label: "Become a Host", desc: "Earn by listing your space", to: "/become-host", gradient: `linear-gradient(135deg,#FFF1F2,#FFE4E6)`, border: "#FECDD3", hover: P },
                      ]
                  ),
                ].map((action, i) => {
                  const inner = (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ background: action.gradient, border: `1px solid ${action.border}`, borderRadius: 20, padding: "22px 20px", cursor: "pointer", transition: "all .2s", height: "100%" }}
                      onMouseOver={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <span style={{ fontSize: 32 }}>{action.emoji}</span>
                      <p style={{ fontFamily: BF, fontWeight: 700, fontSize: 15, color: "#111", marginTop: 14, marginBottom: 4 }}>{action.label}</p>
                      <p style={{ fontFamily: BF, fontSize: 12, color: "#888" }}>{action.desc}</p>
                    </motion.div>
                  );
                  return action.to
                    ? <Link key={i} to={action.to} style={{ textDecoration: "none" }}>{inner}</Link>
                    : <div key={i} onClick={action.action}>{inner}</div>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}