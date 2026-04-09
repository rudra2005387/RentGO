import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../config/apiClient';

const SERVICE_CATEGORIES = [
  { id: 'cleaning', icon: '🧹', title: 'Cleaning Services', desc: 'Professional deep cleaning before and after every stay. Certified cleaners, eco-friendly products.', color: 'from-sky-50 to-blue-50 border-sky-100', tag: 'Most Popular', tagColor: 'bg-sky-100 text-sky-700' },
  { id: 'maintenance', icon: '🔧', title: 'Maintenance & Repairs', desc: 'On-demand property maintenance, plumbing, electrical, and appliance repairs.', color: 'from-amber-50 to-yellow-50 border-amber-100', tag: null },
  { id: 'transfer', icon: '🚗', title: 'Airport Transfers', desc: 'Comfortable, reliable rides to and from the airport — available 24/7.', color: 'from-emerald-50 to-green-50 border-emerald-100', tag: null },
  { id: 'chef', icon: '🍽️', title: 'Personal Chef', desc: 'Hire a local chef for an in-home dining experience. Menus tailored to your taste.', color: 'from-rose-50 to-pink-50 border-rose-100', tag: 'New', tagColor: 'bg-rose-100 text-rose-700' },
  { id: 'insurance', icon: '🛡️', title: 'Stay Protection', desc: 'Comprehensive coverage for your stay — damage, cancellation, and medical emergencies.', color: 'from-violet-50 to-purple-50 border-violet-100', tag: null },
  { id: 'concierge', icon: '🎩', title: 'Concierge', desc: 'Personal concierge for restaurant bookings, event tickets, local tours and more.', color: 'from-orange-50 to-amber-50 border-orange-100', tag: null },
  { id: 'luggage', icon: '📦', title: 'Luggage Storage', desc: 'Secure, insured luggage storage between check-in and check-out.', color: 'from-teal-50 to-cyan-50 border-teal-100', tag: null },
  { id: 'photography', icon: '📸', title: 'Property Photography', desc: 'Professional photography to showcase your property and attract more guests.', color: 'from-indigo-50 to-blue-50 border-indigo-100', tag: 'For Hosts', tagColor: 'bg-indigo-100 text-indigo-700' },
  { id: 'keyexchange', icon: '🔑', title: 'Key Exchange', desc: 'Seamless check-in/check-out with smart locks and 24/7 key exchange service.', color: 'from-gray-50 to-slate-50 border-gray-100', tag: null },
];

const StatPill = ({ value, label }) => (
  <div className="text-center px-6 py-5 border-r border-gray-100 last:border-0">
    <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const ListingCard = ({ listing }) => {
  const img = listing.images?.find((i) => i.isCover)?.url || listing.images?.[0]?.url;
  const city = listing.location?.city || '';
  const price = listing.pricing?.basePrice;
  return (
    <Link to={`/listing/${listing._id}`} className="group">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 relative">
        {img ? (
          <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-5xl">🏡</div>
        )}
        {listing.averageRating >= 4.8 && (
          <span className="absolute top-3 left-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </span>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <p className="font-semibold text-gray-900 truncate text-sm">{listing.title}</p>
          <p className="text-xs text-gray-500">{city}</p>
          {price && <p className="text-sm mt-1"><span className="font-bold text-gray-900">${price.toLocaleString()}</span><span className="text-gray-500 font-normal"> /night</span></p>}
        </div>
        {listing.averageRating && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs font-semibold text-gray-700">{listing.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;

export default function Services() {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [totalListings, setTotalListings] = useState(null);
  const [loading, setLoading] = useState({ featured: true, trending: true });
  const [activeService, setActiveService] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    apiClient.get('/listings/featured?limit=4')
      .then((r) => { if (r.data.success) setFeaturedListings(r.data.data?.listings || []); })
      .catch(() => {})
      .finally(() => setLoading((p) => ({ ...p, featured: false })));

    apiClient.get('/listings/trending?limit=4')
      .then((r) => { if (r.data.success) setTrendingListings(r.data.data?.listings || []); })
      .catch(() => {})
      .finally(() => setLoading((p) => ({ ...p, trending: false })));

    apiClient.get('/listings?limit=1')
      .then((r) => { if (r.data.success) setTotalListings(r.data.data?.pagination?.total); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-[80px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />

      {/* ── HERO */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            RentGo Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Everything your stay needs,
            <br />
            <span className="italic text-[#FF385C]">handled for you.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            From airport transfers to personal chefs — we connect you with trusted service providers so your stay is effortless.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => document.getElementById('services-grid').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#FF385C] text-white font-semibold px-6 py-3 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate('/search')}
              className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              Find a Home
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-gray-100">
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center divide-x divide-gray-100">
            <StatPill value={totalListings ? `${totalListings.toLocaleString()}+` : '500+'} label="Properties Listed" />
            <StatPill value="9" label="Service Categories" />
            <StatPill value="24/7" label="Support Available" />
            <StatPill value="4.9★" label="Avg Service Rating" />
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID */}
      <section id="services-grid" className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Our Services</h2>
          <p className="text-gray-500 text-sm mt-1">Click any service to learn more</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICE_CATEGORIES.map((s) => (
            <div key={s.id}>
              <button
                onClick={() => setActiveService(activeService === s.id ? null : s.id)}
                className={`w-full text-left bg-gradient-to-br ${s.color} border rounded-2xl p-5 hover:shadow-md transition-all duration-200 group ${activeService === s.id ? 'ring-2 ring-[#FF385C] ring-offset-2' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{s.icon}</span>
                  {s.tag && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.tagColor}`}>{s.tag}</span>}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#FF385C] transition-colors">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                <span className="inline-block mt-3 text-xs font-semibold text-[#FF385C]">
                  {activeService === s.id ? 'Hide details ↑' : 'Learn more →'}
                </span>
              </button>

              {activeService === s.id && (
                <div className="mt-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3">How it works</h4>
                  <ol className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex gap-2"><span className="text-[#FF385C] font-bold">1.</span> Select your service and preferred date/time</li>
                    <li className="flex gap-2"><span className="text-[#FF385C] font-bold">2.</span> We match you with a verified local provider</li>
                    <li className="flex gap-2"><span className="text-[#FF385C] font-bold">3.</span> Confirm and pay securely in-app</li>
                    <li className="flex gap-2"><span className="text-[#FF385C] font-bold">4.</span> Rate your experience after completion</li>
                  </ol>
                  <button className="w-full bg-[#FF385C] text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-rose-600 transition-colors">
                    Request {s.title}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED HOMES (real API data) */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Service-ready homes</h2>
            <p className="text-gray-500 text-sm mt-1">Featured properties with all services available</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-[#FF385C] hover:underline flex-shrink-0">View all →</Link>
        </div>
        {loading.featured ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><Skeleton className="aspect-square mb-3" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></div>
            ))}
          </div>
        ) : featuredListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {featuredListings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-gray-500 mb-3">No featured listings available right now</p>
            <Link to="/search" className="text-sm text-[#FF385C] font-semibold hover:underline">Browse all homes →</Link>
          </div>
        )}
      </section>

      {/* ── TRENDING (real API data) */}
      {!loading.trending && trendingListings.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Trending right now</h2>
              <p className="text-gray-500 text-sm mt-1">Most booked properties this week</p>
            </div>
            <Link to="/search?sortBy=popular" className="text-sm font-semibold text-[#FF385C] hover:underline flex-shrink-0">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {trendingListings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        </section>
      )}

      {/* ── HOST / PROVIDER CTA */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-br from-[#FF385C] to-rose-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Are you a service provider?</h2>
            <p className="text-rose-100 text-sm max-w-md">Join our network of verified professionals. Earn more by offering your services to thousands of guests on RentGo.</p>
          </div>
          <Link to="/become-host" className="flex-shrink-0 bg-white text-[#FF385C] font-bold px-6 py-3 rounded-full hover:bg-rose-50 transition-colors shadow-md whitespace-nowrap">
            Join as Provider →
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Get service updates & travel deals</h2>
          <p className="text-gray-500 text-sm mb-6">New services, early access, and exclusive offers — straight to your inbox.</p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
              <span className="text-xl">✅</span> You're subscribed!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-[#FF385C]"
              />
              <button
                onClick={() => { if (email) setSubscribed(true); }}
                className="bg-[#FF385C] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-rose-600 transition-colors text-sm flex-shrink-0"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}