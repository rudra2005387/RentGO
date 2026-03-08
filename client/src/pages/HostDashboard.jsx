import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authFetch = (path, token, opts = {}) =>
  fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  }).then((r) => r.json());

// ── Tiny primitives
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    yellow: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    gray: "bg-gray-100 text-gray-600 ring-gray-200",
    purple: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

const StatCard = ({ label, value, icon, accent, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "—"}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const statusBadgeColor = (s) => {
  if (!s) return "gray";
  const m = { published: "green", active: "green", pending: "yellow", draft: "gray", archived: "gray", confirmed: "green", cancelled: "red", completed: "blue" };
  return m[s.toLowerCase()] || "gray";
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const TABS = ["Overview", "Listings", "Booking Requests"];

export default function HostDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState({ stats: true, listings: true, bookings: true });
  const setLoaded = (k) => setLoading((p) => ({ ...p, [k]: false }));

  const [actionLoading, setActionLoading] = useState({});

  const userId = user?._id || user?.id;

  const fetchAll = useCallback(async () => {
    if (!token || !userId) return;

    authFetch(`/users/${userId}/stats`, token)
      .then((d) => { if (d.success) setStats(d.data?.stats); })
      .catch(() => {})
      .finally(() => setLoaded("stats"));

    authFetch(`/users/${userId}/listings?limit=50`, token)
      .then((d) => {
        if (d.success) {
          setListings(d.data?.listings || d.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded("listings"));

    authFetch(`/bookings?role=host&limit=30`, token)
      .then((d) => { if (d.success) setBookings(d.data?.bookings || []); })
      .catch(() => {})
      .finally(() => setLoaded("bookings"));
  }, [token, userId]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user?.role !== "host") { navigate("/dashboard"); return; }
    fetchAll();
  }, [fetchAll, token, user, navigate]);

  // Accept / Reject booking
  const handleBookingStatus = async (bookingId, status) => {
    setActionLoading((p) => ({ ...p, [bookingId]: status }));
    try {
      const d = await authFetch(`/bookings/${bookingId}/status`, token, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (d.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
        );
      }
    } catch {}
    setActionLoading((p) => ({ ...p, [bookingId]: null }));
  };

  // Archive listing
  const handleArchive = async (listingId) => {
    setActionLoading((p) => ({ ...p, [listingId]: "archiving" }));
    try {
      const d = await authFetch(`/listings/${listingId}/archive`, token, { method: "POST", body: JSON.stringify({}) });
      if (d.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === listingId ? { ...l, status: "archived" } : l))
        );
      }
    } catch {}
    setActionLoading((p) => ({ ...p, [listingId]: null }));
  };

  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending");
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Host";

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "#FF385C" }}>RentGo</Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <span className="text-sm font-semibold text-gray-600 hidden sm:block">Hosting</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/create-listing" className="inline-flex items-center gap-1.5 bg-[#FF385C] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-rose-600 transition-colors">
              + New Listing
            </Link>
            <Link to="/dashboard" className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:border-gray-300 transition-colors">
              Guest view
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
            Host Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your listings, bookings, and earnings, {user?.firstName || displayName}.</p>
        </div>

        {/* Tab bar */}
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
              {tab === "Booking Requests" && pendingBookings.length > 0 && (
                <span className="ml-1.5 bg-rose-100 text-rose-600 rounded-full px-1.5 text-xs">{pendingBookings.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Earnings cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading.stats ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : (
                <>
                  <StatCard
                    label="Total Earned"
                    value={`$${(stats?.totalEarnings ?? 0).toLocaleString()}`}
                    icon="💰"
                    accent="bg-emerald-50"
                    sub="All time"
                  />
                  <StatCard
                    label="This Month"
                    value={`$${(stats?.monthlyEarnings ?? stats?.thisMonthEarnings ?? 0).toLocaleString()}`}
                    icon="📅"
                    accent="bg-sky-50"
                    sub="Current period"
                  />
                  <StatCard
                    label="Total Listings"
                    value={stats?.totalListings ?? listings.length}
                    icon="🏠"
                    accent="bg-violet-50"
                    sub="Properties"
                  />
                  <StatCard
                    label="Avg Rating"
                    value={stats?.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : "—"}
                    icon="⭐"
                    accent="bg-amber-50"
                    sub="Guest reviews"
                  />
                </>
              )}
            </div>

            {/* Performance stats */}
            {stats && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-4 text-base" style={{ fontFamily: "Fraunces, serif" }}>Performance</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate ? `${stats.occupancyRate}%` : "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">Occupancy Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.responseRate ? `${stats.responseRate}%` : "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">Response Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.completedBookings ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed Stays</p>
                  </div>
                </div>
                {stats.superhost && (
                  <div className="mt-4 flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2 w-fit">
                    <span className="text-lg">🏅</span>
                    <span className="text-sm font-semibold text-amber-700">Superhost</span>
                  </div>
                )}
              </div>
            )}

            {/* Pending requests preview */}
            {pendingBookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔔</span>
                    <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Pending Requests</h2>
                    <Badge color="yellow">{pendingBookings.length}</Badge>
                  </div>
                  <button onClick={() => setActiveTab("Booking Requests")} className="text-xs text-rose-500 font-semibold hover:underline">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {pendingBookings.slice(0, 3).map((b) => (
                    <BookingRequestRow key={b._id} booking={b} onAction={handleBookingStatus} actionLoading={actionLoading} />
                  ))}
                </div>
              </div>
            )}

            {/* Active listings preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Active Listings</h2>
                <button onClick={() => setActiveTab("Listings")} className="text-xs text-rose-500 font-semibold hover:underline">
                  View all →
                </button>
              </div>
              {loading.listings ? (
                <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : listings.filter((l) => l.status === "published" || l.status === "active").length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🏠</p>
                  <p className="text-gray-500 font-medium">No active listings yet</p>
                  <Link to="/create-listing" className="mt-2 inline-block text-sm text-rose-500 font-semibold hover:underline">
                    Create your first listing →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {listings.filter((l) => l.status === "published" || l.status === "active").slice(0, 4).map((l) => (
                    <ListingRow key={l._id} listing={l} onArchive={handleArchive} actionLoading={actionLoading} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ LISTINGS TAB ════ */}
        {activeTab === "Listings" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>All Listings</h2>
                <Badge color="blue">{listings.length}</Badge>
              </div>
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-1 text-sm text-white bg-[#FF385C] px-4 py-2 rounded-full font-semibold hover:bg-rose-600 transition-colors"
              >
                + Add New
              </Link>
            </div>
            {loading.listings ? (
              <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🏡</p>
                <p className="text-gray-500 font-medium">No listings yet</p>
                <Link to="/create-listing" className="mt-3 inline-block text-sm text-rose-500 font-semibold hover:underline">
                  Create your first listing →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {listings.map((l) => (
                  <ListingRow key={l._id} listing={l} onArchive={handleArchive} actionLoading={actionLoading} showAll />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ BOOKING REQUESTS TAB ════ */}
        {activeTab === "Booking Requests" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "Fraunces, serif" }}>Booking Requests</h2>
              <Badge color="yellow">{pendingBookings.length} pending</Badge>
              <Badge color="blue">{bookings.length} total</Badge>
            </div>
            {loading.bookings ? (
              <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-gray-500 font-medium">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <BookingRequestRow key={b._id} booking={b} onAction={handleBookingStatus} actionLoading={actionLoading} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ── Listing Row sub-component
function ListingRow({ listing, onArchive, actionLoading, showAll }) {
  const img = listing.images?.[0]?.url;
  const status = listing.status || "draft";
  const isArchiving = actionLoading[listing._id] === "archiving";
  const isArchived = status === "archived";

  if (!showAll && isArchived) return null;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {img ? (
          <img src={img} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-xl">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
        <p className="text-xs text-gray-400">{listing.location?.city}{listing.location?.country ? `, ${listing.location.country}` : ""}</p>
        {listing.pricing?.basePrice && (
          <p className="text-xs text-rose-500 font-semibold mt-0.5">${listing.pricing.basePrice}/night</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge color={statusBadgeColor(status)}>{status}</Badge>
        {!isArchived && (
          <button
            onClick={() => onArchive(listing._id)}
            disabled={isArchiving}
            className="text-xs text-gray-400 hover:text-rose-500 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-40"
          >
            {isArchiving ? "…" : "Archive"}
          </button>
        )}
        <Link
          to={`/listing/${listing._id}`}
          className="text-xs text-gray-400 hover:text-sky-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

// ── Booking Request Row sub-component
function BookingRequestRow({ booking, onAction, actionLoading }) {
  const listing = booking.listing || {};
  const guest = booking.guest || booking.user || {};
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(" ") || guest.email || "Guest";
  const total = booking.pricing?.total;
  const status = booking.status;
  const isPending = status?.toLowerCase() === "pending";
  const isActing = actionLoading[booking._id];

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {guestName.slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{guestName}</p>
        <p className="text-xs text-gray-500 truncate">{listing.title || "Property"}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {total && <span className="text-sm font-semibold text-gray-700">${total.toLocaleString()}</span>}
        <Badge color={statusBadgeColor(status)}>{status}</Badge>
        {isPending && (
          <>
            <button
              onClick={() => onAction(booking._id, "confirmed")}
              disabled={!!isActing}
              className="text-xs bg-emerald-500 text-white font-semibold px-3 py-1 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40"
            >
              {isActing === "confirmed" ? "…" : "Accept"}
            </button>
            <button
              onClick={() => onAction(booking._id, "cancelled")}
              disabled={!!isActing}
              className="text-xs bg-rose-50 text-rose-600 font-semibold px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-40"
            >
              {isActing === "cancelled" ? "…" : "Reject"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
