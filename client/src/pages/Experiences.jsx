import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORIES = [
  { label: "Nature", icon: "🌲" },
  { label: "City", icon: "🏙️" },
  { label: "Beach", icon: "🏖️" },
  { label: "Mountain", icon: "⛰️" },
  { label: "Culture", icon: "🎭" },
  { label: "Adventure", icon: "🧗" },
];

const HOW_IT_WORKS = [
  { icon: "🔍", title: "Search", desc: "Browse thousands of unique properties across every destination." },
  { icon: "📅", title: "Book", desc: "Reserve with confidence — flexible cancellation on most stays." },
  { icon: "🏡", title: "Stay", desc: "Check in and experience your home away from home." },
];

// ── Card component
const ListingCard = ({ listing }) => {
  const img = listing.images?.[0]?.url;
  const city = listing.location?.city || listing.location?.country || "";
  const price = listing.pricing?.basePrice;
  const rating = listing.ratings?.average || listing.averageRating;

  return (
    <Link to={`/listing/${listing._id}`} className="group block flex-shrink-0">
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {img ? (
          <img
            src={img}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-4xl">
            🏠
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{listing.title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{city}</p>
      <div className="flex items-center justify-between mt-1">
        {price ? (
          <p className="text-sm font-bold text-gray-900">
            <span className="text-rose-500">${price}</span>
            <span className="font-normal text-gray-500"> / night</span>
          </p>
        ) : <span />}
        {rating ? (
          <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5">
            ★ {typeof rating === "number" ? rating.toFixed(1) : rating}
          </span>
        ) : null}
      </div>
    </Link>
  );
};

// ── Card skeleton
const CardSkeleton = () => (
  <div className="flex-shrink-0">
    <div className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse mb-3" />
    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2 w-3/4" />
    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
  </div>
);

// ── Section wrapper
const Section = ({ title, subtitle, listings, loading, count = 4 }) => (
  <section className="mb-12">
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {loading
        ? Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)
        : listings.slice(0, count).map((l) => <ListingCard key={l._id} listing={l} />)}
    </div>
  </section>
);

export default function Experiences() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/listings/featured?limit=8`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFeatured(d.data?.listings || d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    fetch(`${API_BASE}/listings/trending?limit=8`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTrending(d.data?.listings || d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingTrending(false));

    fetch(`${API_BASE}/listings?sortBy=rating&limit=12`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTopRated(d.data?.listings || d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingTopRated(false));
  }, []);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    navigate(`/search?category=${cat.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />

      {/* ── Hero Banner */}
      <div className="relative bg-gradient-to-br from-rose-500 via-pink-600 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-3">Discover the world</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
            Unique experiences,<br />unforgettable stays
          </h1>
          <p className="text-base opacity-80 max-w-lg mx-auto mb-8">
            From cosy mountain cabins to beachfront villas — find the stay that fits your story.
          </p>
          <Link
            to="/search"
            className="inline-block bg-white text-rose-600 text-sm font-bold px-8 py-3 rounded-full hover:bg-rose-50 transition-colors shadow-lg"
          >
            Explore all stays
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Category chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.label)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.label
                  ? "bg-[#FF385C] text-white border-[#FF385C] shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Featured */}
        <Section
          title="Featured Stays"
          subtitle="Hand-picked properties our guests love"
          listings={featured}
          loading={loadingFeatured}
          count={8}
        />

        {/* ── Trending */}
        <Section
          title="Trending This Week"
          subtitle="The most-booked spots right now"
          listings={trending}
          loading={loadingTrending}
          count={8}
        />

        {/* ── Top Rated */}
        <Section
          title="Top Rated"
          subtitle="Consistently exceptional stays"
          listings={topRated}
          loading={loadingTopRated}
          count={12}
        />

        {/* ── How it Works */}
        <section className="mt-4 mb-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-10">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "Fraunces, serif" }}>
              How it works
            </h2>
            <p className="text-sm text-gray-400 text-center mb-10">Your perfect stay, three steps away</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl mx-auto mb-4">
                    {step.icon}
                  </div>
                  <p className="font-bold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
