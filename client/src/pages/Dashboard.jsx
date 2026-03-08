import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReviewForm from "../components/ReviewForm";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── API helpers ────────────────────────────────────────────────────────────
const authFetch = (path, token) =>
  fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// ─── Tiny UI primitives ─────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    yellow: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    gray: "bg-gray-100 text-gray-600 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${colors[color]}`}>
      {children}
    </span>
  );
};

const statusColor = (s) => {
  if (!s) return "gray";
  const m = { confirmed: "green", pending: "yellow", cancelled: "red", completed: "blue" };
  return m[s.toLowerCase()] || "gray";
};

const Avatar = ({ name, image, size = "md" }) => {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  return image ? (
    <img src={image} alt={name} className={`${sz[size]} rounded-full object-cover ring-2 ring-white`} />
  ) : (
    <div className={`${sz[size]} rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold ring-2 ring-white`}>
      {initials}
    </div>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "—"}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Booking Row ─────────────────────────────────────────────────────────────
const BookingRow = ({ booking }) => {
  const listing = booking.listing || {};
  const img = listing.images?.[0]?.url;
  const title = listing.title || "Listing";
  const city = listing.location?.city || "";
  const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const total = booking.pricing?.total;
  const ref = booking.bookingReference || booking._id?.slice(-8).toUpperCase();

  return (
    <Link to={`/booking/${booking._id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {img ? (
          <img src={img} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-2xl">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500">{city}</p>
        <p className="text-xs text-gray-400 mt-0.5">{checkIn} → {checkOut}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <Badge color={statusColor(booking.status)}>{booking.status}</Badge>
        {total && <p className="text-sm font-semibold text-gray-700 mt-1">${total.toLocaleString()}</p>}
        <p className="text-xs text-gray-400">#{ref}</p>
      </div>
    </Link>
  );
};

// ─── Wishlist Card ────────────────────────────────────────────────────────────
const WishlistCard = ({ item }) => {
  const img = item.images?.[0]?.url;
  const city = item.location?.city || "";
  const price = item.pricing?.basePrice;
  return (
    <Link to={`/listing/${item._id}`} className="group flex-shrink-0 w-44">
      <div className="w-44 h-32 rounded-xl overflow-hidden bg-gray-100 mb-2">
        {img ? (
          <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-3xl">🏡</div>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
      <p className="text-xs text-gray-500">{city}</p>
      {price && <p className="text-xs font-semibold text-rose-500 mt-0.5">${price}/night</p>}
    </Link>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const author = review.author || {};
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ") || "Guest";
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={name} image={author.profileImage} size="sm" />
        <div>
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < review.overallRating ? "text-amber-400" : "text-gray-200"}`}>★</span>
          ))}
        </div>
      </div>
      {review.comment && <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>}
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ["Overview", "My Bookings", "Saved / Wishlist", "Reviews", "Quick Actions"];

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  // Data state
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  // Loading / error
  const [loading, setLoading] = useState({ bookings: true, wishlist: true, reviews: true, stats: true, profile: true });
  const setLoaded = (key) => setLoading((p) => ({ ...p, [key]: false }));

  const userId = user?._id || user?.id;

  const fetchAll = useCallback(async () => {
    if (!token || !userId) return;

    // Profile
    authFetch(`/users/${userId}`, token)
      .then((d) => { if (d.success) setProfile(d.data?.user); })
      .catch(() => {})
      .finally(() => setLoaded("profile"));

    // Stats
    authFetch(`/users/${userId}/stats`, token)
      .then((d) => { if (d.success) setStats(d.data?.stats); })
      .catch(() => {})
      .finally(() => setLoaded("stats"));

    // Bookings
    authFetch(`/bookings?role=guest&limit=20`, token)
      .then((d) => { if (d.success) setBookings(d.data?.bookings || []); })
      .catch(() => {})
      .finally(() => setLoaded("bookings"));

    // Wishlist
    authFetch(`/users/${userId}/wishlist?limit=12`, token)
      .then((d) => { if (d.success) setWishlist(d.data?.wishlist || []); })
      .catch(() => {})
      .finally(() => setLoaded("wishlist"));

    // Reviews (reviews about the user)
    authFetch(`/users/${userId}/reviews?limit=10`, token)
      .then((d) => { if (d.success) setReviews(d.data?.reviews || []); })
      .catch(() => {})
      .finally(() => setLoaded("reviews"));
  }, [token, userId]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, [fetchAll, token, navigate]);

  const upcomingBookings = bookings.filter((b) => ["confirmed", "pending"].includes(b.status?.toLowerCase()));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status?.toLowerCase()));
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User";
  const isHost = user?.role === "host";

  // ── Booking stats summary
  const totalSpent = bookings
    .filter((b) => b.status?.toLowerCase() === "completed")
    .reduce((acc, b) => acc + (b.pricing?.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />

      {/* ── Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "#FF385C" }}>
            RentGo
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/search" className="hover:text-gray-900 transition-colors">Explore</Link>
            {isHost && <Link to="/create-listing" className="hover:text-gray-900 transition-colors">My Listings</Link>}
          </nav>
          <div className="flex items-center gap-3">
            <Avatar name={displayName} image={profile?.profileImage} size="md" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="ml-2 text-xs text-gray-400 hover:text-rose-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 hover:border-rose-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Hero greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
              Welcome back, {user?.firstName || "there"} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Here's what's happening with your account
            </p>
          </div>
          {isHost && (
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-2 bg-[#FF385C] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
            >
              + New Listing
            </Link>
          )}
        </div>

        {/* ── Tab bar */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
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

        {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading.bookings ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : (
                <>
                  <StatCard label="Upcoming Trips" value={upcomingBookings.length} icon="✈️" accent="bg-sky-50" sub="Active bookings" />
                  <StatCard label="Past Trips" value={pastBookings.length} icon="🏁" accent="bg-emerald-50" sub="Completed stays" />
                  <StatCard label="Saved Places" value={wishlist.length} icon="❤️" accent="bg-rose-50" sub="In wishlist" />
                  <StatCard label="Total Spent" value={`$${totalSpent.toLocaleString()}`} icon="💳" accent="bg-violet-50" sub="All time" />
                </>
              )}
            </div>

            {/* Host stats (if host) */}
            {isHost && stats && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-800 mb-4 text-base" style={{ fontFamily: "Fraunces, serif" }}>
                  Host Dashboard
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.totalListings ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.completedBookings ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">${(stats.totalEarnings ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.averageRating?.toFixed(1) ?? "—"} ⭐</p>
                    <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
                  </div>
                </div>
                {stats.superhost && (
                  <div className="mt-4 flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2 w-fit">
                    <span className="text-lg">🏅</span>
                    <span className="text-sm font-semibold text-amber-700">Superhost · {stats.responseRate}% response rate</span>
                  </div>
                )}
              </div>
            )}

            {/* Recent bookings preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Recent Bookings</h2>
                <button onClick={() => setActiveTab("My Bookings")} className="text-xs text-rose-500 font-semibold hover:underline">
                  View all →
                </button>
              </div>
              {loading.bookings ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🧳</p>
                  <p className="text-gray-500 font-medium">No bookings yet</p>
                  <Link to="/search" className="mt-3 inline-block text-sm text-rose-500 font-semibold hover:underline">
                    Explore homes →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 4).map((b) => <BookingRow key={b._id} booking={b} />)}
                </div>
              )}
            </div>

            {/* Wishlist preview */}
            {wishlist.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Saved Places</h2>
                  <button onClick={() => setActiveTab("Saved / Wishlist")} className="text-xs text-rose-500 font-semibold hover:underline">
                    View all →
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 py-4 scrollbar-hide">
                  {wishlist.slice(0, 6).map((item) => <WishlistCard key={item._id} item={item} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ MY BOOKINGS TAB ═══════════════════ */}
        {activeTab === "My Bookings" && (
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <span className="text-lg">✈️</span>
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>
                  Upcoming Bookings
                </h2>
                <Badge color="blue">{upcomingBookings.length}</Badge>
              </div>
              {loading.bookings ? (
                <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🗓️</p>
                  <p className="text-gray-500">No upcoming bookings</p>
                  <Link to="/search" className="mt-2 inline-block text-sm text-rose-500 font-semibold hover:underline">Find your next stay →</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcomingBookings.map((b) => <BookingRow key={b._id} booking={b} />)}
                </div>
              )}
            </div>

            {/* Past */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <span className="text-lg">🏁</span>
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>
                  Past & Cancelled
                </h2>
                <Badge color="gray">{pastBookings.length}</Badge>
              </div>
              {loading.bookings ? (
                <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500">No past bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pastBookings.map((b) => <BookingRow key={b._id} booking={b} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════ WISHLIST TAB ═══════════════════ */}
        {activeTab === "Saved / Wishlist" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <span className="text-lg">❤️</span>
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Saved Places</h2>
              <Badge color="red">{wishlist.length}</Badge>
            </div>
            {loading.wishlist ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🤍</p>
                <p className="text-gray-500 font-medium">No saved places yet</p>
                <Link to="/search" className="mt-3 inline-block text-sm text-rose-500 font-semibold hover:underline">
                  Explore and save homes →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 p-6">
                {wishlist.map((item) => (
                  <Link key={item._id} to={`/listing/${item._id}`} className="group">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-4xl">🏡</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.location?.city}</p>
                    {item.pricing?.basePrice && (
                      <p className="text-xs font-bold text-rose-500 mt-0.5">${item.pricing.basePrice}/night</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ REVIEWS TAB ═══════════════════ */}
        {activeTab === "Reviews" && (
          <div className="space-y-6">
            {/* Leave a review prompt for completed bookings */}
            {pastBookings.filter((b) => b.status?.toLowerCase() === "completed").length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Leave a Review</h2>
                </div>
                <div className="p-6 space-y-3">
                  {pastBookings
                    .filter((b) => b.status?.toLowerCase() === "completed")
                    .slice(0, 5)
                    .map((b) => (
                      <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          {b.listing?.images?.[0]?.url && (
                            <img src={b.listing.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{b.listing?.title || "Listing"}</p>
                            <p className="text-xs text-gray-500">{b.listing?.location?.city || ""}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setReviewBookingId(b._id)}
                          className="flex-shrink-0 text-sm font-semibold text-[#FF385C] border border-[#FF385C] px-4 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Write Review
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Reviews about you */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Reviews About You</h2>
                <Badge color="yellow">{reviews.length}</Badge>
              </div>
              {loading.reviews ? (
                <div className="grid sm:grid-cols-2 gap-4 p-6">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Reviews appear here after completed stays</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 p-6">
                  {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
                </div>
              )}
            </div>

            {/* ReviewForm modal */}
            {reviewBookingId && (
              <ReviewForm
                bookingId={reviewBookingId}
                token={token}
                onClose={() => setReviewBookingId(null)}
                onSubmitted={() => fetchAll()}
              />
            )}
          </div>
        )}

        {/* ═══════════════════ QUICK ACTIONS TAB ═══════════════════ */}
        {activeTab === "Quick Actions" && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🔍", label: "Explore Homes", desc: "Find your next getaway", to: "/search", color: "from-sky-50 to-blue-50 border-sky-100" },
              { icon: "👤", label: "Edit Profile", desc: "Update your info & photo", to: "/profile", color: "from-violet-50 to-purple-50 border-violet-100" },
              { icon: "🔒", label: "Change Password", desc: "Keep your account secure", to: "/profile?tab=security", color: "from-amber-50 to-yellow-50 border-amber-100" },
              { icon: "📋", label: "All Bookings", desc: "View your full booking history", to: null, action: () => setActiveTab("My Bookings"), color: "from-emerald-50 to-green-50 border-emerald-100" },
              ...(isHost
                ? [
                    { icon: "🏠", label: "Create Listing", desc: "List a new property", to: "/create-listing", color: "from-rose-50 to-pink-50 border-rose-100" },
                    { icon: "📊", label: "Hosting Dashboard", desc: "Manage your listings", to: "/hosting", color: "from-orange-50 to-amber-50 border-orange-100" },
                  ]
                : [
                    { icon: "🏡", label: "Become a Host", desc: "Earn by listing your space", to: "/become-host", color: "from-rose-50 to-pink-50 border-rose-100" },
                  ]),
            ].map((action, i) => {
              const inner = (
                <div className={`bg-gradient-to-br ${action.color} border rounded-2xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer group h-full`}>
                  <span className="text-3xl">{action.icon}</span>
                  <p className="font-bold text-gray-800 mt-3 group-hover:text-rose-600 transition-colors">{action.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                </div>
              );
              return action.to ? (
                <Link key={i} to={action.to}>{inner}</Link>
              ) : (
                <div key={i} onClick={action.action}>{inner}</div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}