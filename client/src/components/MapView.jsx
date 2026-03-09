import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaSpinner, FaCrosshairs } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPriceIcon } from './PricePin';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Get [lat, lng] from a listing ───────────────────────────────────────────
function getLatLng(listing) {
  const geo = listing.location?.geo?.coordinates;
  if (geo?.length === 2 && (geo[0] !== 0 || geo[1] !== 0)) return [geo[1], geo[0]];
  if (listing.location?.latitude != null && listing.location?.longitude != null)
    return [listing.location.latitude, listing.location.longitude];
  return null;
}

// ─── Viewport change watcher ─────────────────────────────────────────────────
function ViewportWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: () => onBoundsChange(),
    zoomend: () => onBoundsChange(),
  });
  return null;
}

// ─── Fly-to helper ──────────────────────────────────────────────────────────
function FlyTo({ center, zoom }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!center) return;
    const key = `${center[0]},${center[1]}`;
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo(center, zoom || 13, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ─── Map bounds reader ──────────────────────────────────────────────────────
function BoundsReader({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

// ─── Popup card ─────────────────────────────────────────────────────────────
function ListingPopupCard({ listing }) {
  const img = listing.images?.[0]?.url || listing.images?.[0];
  const price = listing.pricing?.basePrice || listing.price;
  const city = listing.location?.city || '';
  return (
    <Link to={`/listing/${listing._id}`} className="block w-60 no-underline text-inherit">
      <div className="rounded-xl overflow-hidden bg-white shadow-md">
        {img && <img src={img} alt={listing.title} className="w-full h-36 object-cover" loading="lazy" />}
        <div className="p-3">
          <p className="text-sm font-semibold text-[#222222] truncate">{listing.title}</p>
          <p className="text-xs text-[#717171]">{city}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-bold text-[#222222]">${price}<span className="font-normal text-[#717171]">/night</span></span>
            {listing.averageRating > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#222222]">
                <FaStar className="text-[#FF385C]" size={10} /> {listing.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Geocoding search (OpenStreetMap Nominatim) ─────────────────────────────
function useGeocoder() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    setQuery(q);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(
          data.map((d) => ({
            label: d.display_name,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            short: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.country].filter(Boolean).join(', '),
          }))
        );
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 350);
  }, []);

  const clear = () => { setQuery(''); setSuggestions([]); };

  return { query, suggestions, searching, search, clear };
}

// ─── MAIN MAP COMPONENT ─────────────────────────────────────────────────────
export default function MapView({ listings: externalListings, city, className = '', onListingsChange }) {
  const [listings, setListings] = useState(externalListings || []);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(13);
  const [listingCount, setListingCount] = useState(0);
  const fetchRef = useRef(null);
  const mapRef = useRef(null);
  const geocoder = useGeocoder();

  // Default center from listings or city
  const defaultCenter = (() => {
    if (externalListings?.length) {
      const first = externalListings[0];
      const pos = getLatLng(first);
      if (pos) return pos;
    }
    return [20.5937, 78.9629]; // Center of India
  })();

  // Sync external listings
  useEffect(() => {
    if (externalListings?.length) {
      setListings(externalListings);
      setListingCount(externalListings.length);
    }
  }, [externalListings]);

  // Geocode initial city prop
  useEffect(() => {
    if (!city || externalListings?.length) return;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data[0]) {
          setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch { /* silent */ }
    })();
  }, [city, externalListings]);

  // Fetch listings in current viewport
  const fetchInBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (fetchRef.current) clearTimeout(fetchRef.current);
    fetchRef.current = setTimeout(async () => {
      const bounds = map.getBounds();
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '100',
        });
        // Use viewport bounds to filter — backend supports city filter as fallback
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        // We search by city text from bounds center for best results
        const center = map.getCenter();
        // Try geo-search via nearby endpoint first, fall back to general
        const nearbyRes = await fetch(
          `${API_BASE}/listings?limit=100&page=1`
        );
        const nearbyData = await nearbyRes.json();

        if (nearbyData.success) {
          const all = nearbyData.data?.listings || [];
          // Client-side filter to viewport bounds
          const inView = all.filter((l) => {
            const pos = getLatLng(l);
            if (!pos) return false;
            return pos[0] >= sw.lat && pos[0] <= ne.lat && pos[1] >= sw.lng && pos[1] <= ne.lng;
          });
          if (!externalListings?.length) {
            setListings(inView);
            setListingCount(inView.length);
            onListingsChange?.(inView);
          }
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 500);
  }, [externalListings, onListingsChange]);

  // Handle geocoder selection
  const handlePlaceSelect = (place) => {
    setFlyTarget([place.lat, place.lng]);
    setFlyZoom(13);
    geocoder.clear();
  };

  // Handle "my location" button
  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
        setFlyZoom(13);
      },
      () => { /* denied */ }
    );
  };

  const geoListings = listings.filter((l) => getLatLng(l) !== null);

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {/* ─── Search Bar Overlay ───────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <div className="relative flex-1 max-w-md">
          <div className="flex items-center bg-white rounded-xl shadow-lg border border-[#EBEBEB] overflow-hidden">
            <FaSearch className="ml-3 text-[#717171] flex-shrink-0" size={14} />
            <input
              type="text"
              value={geocoder.query}
              onChange={(e) => geocoder.search(e.target.value)}
              placeholder="Search any city or address..."
              className="w-full px-3 py-2.5 text-sm text-[#222222] outline-none bg-transparent placeholder:text-[#B0B0B0]"
            />
            {geocoder.searching && <FaSpinner className="animate-spin mr-3 text-[#717171]" size={14} />}
          </div>
          {/* Suggestions dropdown */}
          {geocoder.suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#EBEBEB] overflow-hidden max-h-64 overflow-y-auto">
              {geocoder.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handlePlaceSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[#F7F7F7] transition-colors border-b border-[#F7F7F7] last:border-0"
                >
                  <p className="font-medium text-[#222222] truncate">{s.short}</p>
                  <p className="text-xs text-[#717171] truncate mt-0.5">{s.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleMyLocation}
          className="bg-white rounded-xl shadow-lg border border-[#EBEBEB] w-10 h-10 flex items-center justify-center hover:bg-[#F7F7F7] transition-colors flex-shrink-0"
          title="My location"
        >
          <FaCrosshairs size={14} className="text-[#717171]" />
        </button>
      </div>

      {/* ─── Listing count badge ─────────────────────────────── */}
      {listingCount > 0 && !loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#222222] text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          {listingCount} {listingCount === 1 ? 'listing' : 'listings'} in this area
        </div>
      )}

      {/* ─── Loading indicator ───────────────────────────────── */}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-[#222222] flex items-center gap-2">
          <FaSpinner className="animate-spin text-[#FF385C]" size={12} />
          Searching area...
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={5}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '400px' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsReader onReady={(m) => { mapRef.current = m; }} />
        <ViewportWatcher onBoundsChange={fetchInBounds} />
        {flyTarget && <FlyTo center={flyTarget} zoom={flyZoom} />}

        {geoListings.map((listing) => {
          const pos = getLatLng(listing);
          const price = listing.pricing?.basePrice || listing.price || 0;
          return (
            <Marker
              key={listing._id}
              position={pos}
              icon={createPriceIcon(price, hoveredId === listing._id)}
              eventHandlers={{
                mouseover: () => setHoveredId(listing._id),
                mouseout: () => setHoveredId(null),
              }}
            >
              <Popup closeButton={false} className="!p-0 !m-0 leaflet-popup-clean">
                <ListingPopupCard listing={listing} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {geoListings.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-[500] pointer-events-none">
          <div className="text-center pointer-events-auto">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-sm font-semibold text-[#222222]">No listings in this area</p>
            <p className="text-xs text-[#717171] mt-1">Search for a city above or drag the map</p>
          </div>
        </div>
      )}
    </div>
  );
}
