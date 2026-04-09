import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaSpinner, FaCrosshairs } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPriceIcon } from './PricePin';
import apiClient from '../config/apiClient';

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Validate a [lat, lng] pair is usable ────────────────────────────────────
function isValidLatLng(lat, lng) {
  return (
    lat != null && lng != null &&
    typeof lat === 'number' && typeof lng === 'number' &&
    isFinite(lat) && isFinite(lng) &&
    !isNaN(lat) && !isNaN(lng) &&
    !(lat === 0 && lng === 0) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// ─── Safe parse — returns null instead of NaN ────────────────────────────────
function safeNum(v) {
  const n = Number(v);
  return isFinite(n) && !isNaN(n) ? n : null;
}

// ─── Get [lat, lng] from a listing (null if invalid) ─────────────────────────
function getLatLng(listing) {
  if (!listing) return null;

  // GeoJSON Point: location.coordinates = [lng, lat]
  const coords = listing.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const lat = safeNum(coords[1]);
    const lng = safeNum(coords[0]);
    if (lat !== null && lng !== null && isValidLatLng(lat, lng)) return [lat, lng];
  }

  // Nested geo: location.geo.coordinates = [lng, lat]
  const geo = listing.location?.geo?.coordinates;
  if (Array.isArray(geo) && geo.length === 2) {
    const lat = safeNum(geo[1]);
    const lng = safeNum(geo[0]);
    if (lat !== null && lng !== null && isValidLatLng(lat, lng)) return [lat, lng];
  }

  // Flat lat/lng fields
  const lat = safeNum(listing.location?.latitude ?? listing.location?.lat);
  const lng = safeNum(listing.location?.longitude ?? listing.location?.lng);
  if (lat !== null && lng !== null && isValidLatLng(lat, lng)) return [lat, lng];

  return null;
}

// ─── Safely build a fly target — returns null if coords are bad ──────────────
function safeCenter(lat, lng) {
  const la = safeNum(lat);
  const lo = safeNum(lng);
  if (la !== null && lo !== null && isValidLatLng(la, lo)) return [la, lo];
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

// ─── Fly-to helper ────────────────────────────────────────────────────────────
// Uses setView (no animation) instead of flyTo to avoid Leaflet's animation
// frame calling unproject() with NaN during mid-flight projection math.
function FlyTo({ center, zoom }) {
  const map = useMap();
  const prev = useRef(null);

  useEffect(() => {
    if (!center || !Array.isArray(center) || center.length < 2) return;
    const [lat, lng] = center;
    if (!isValidLatLng(lat, lng)) return;

    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (prev.current === key) return;
    prev.current = key;

    try {
      // Stop any in-progress animation first, then jump — no frame loop, no NaN
      map.stop();
      map.setView([lat, lng], zoom || 13, { animate: false });
    } catch (e) {
      console.warn('[MapView] setView failed:', e);
    }
  }, [center, zoom, map]);

  return null;
}

// ─── Map bounds reader ───────────────────────────────────────────────────────
function BoundsReader({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

// ─── Popup card ──────────────────────────────────────────────────────────────
function ListingPopupCard({ listing }) {
  const img = listing.images?.[0]?.url || listing.images?.[0];
  const price = listing.pricing?.basePrice || listing.price;
  const city = listing.location?.city || '';
  return (
    <Link to={`/listing/${listing._id}`} className="block w-60 no-underline text-inherit">
      <div className="rounded-xl overflow-hidden bg-white shadow-md">
        {img && (
          <img
            src={img}
            alt={listing.title}
            className="w-full h-36 object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="p-3">
          <p className="text-sm font-semibold text-[#222222] truncate">{listing.title}</p>
          <p className="text-xs text-[#717171]">{city}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-bold text-[#222222]">
              ${price}<span className="font-normal text-[#717171]">/night</span>
            </span>
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

// ─── Geocoding search (OpenStreetMap Nominatim) ──────────────────────────────
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
          data
            .map((d) => ({
              label: d.display_name,
              lat: safeNum(d.lat),
              lng: safeNum(d.lon),
              short: [
                d.address?.city || d.address?.town || d.address?.village || d.name,
                d.address?.country,
              ].filter(Boolean).join(', '),
            }))
            // Only keep suggestions with valid coords
            .filter((s) => s.lat !== null && s.lng !== null && isValidLatLng(s.lat, s.lng))
        );
      } catch { /* silent */ } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const clear = () => { setQuery(''); setSuggestions([]); };
  return { query, suggestions, searching, search, clear };
}

// ─── MAIN MAP COMPONENT ──────────────────────────────────────────────────────
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

  const FALLBACK_CENTER = [22.5726, 88.3639]; // Kolkata

  // Compute a valid default center from listings, or fall back
  const defaultCenter = (() => {
    if (externalListings?.length) {
      for (const l of externalListings) {
        const pos = getLatLng(l);
        if (pos) return pos;
      }
    }
    return FALLBACK_CENTER;
  })();

  // Sync external listings
  useEffect(() => {
    if (externalListings?.length) {
      setListings(externalListings);
      setListingCount(externalListings.length);
    }
  }, [externalListings]);

  // Geocode initial city prop → only set flyTarget if coords are valid
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
          const center = safeCenter(data[0].lat, data[0].lon);
          if (center) setFlyTarget(center); // ← only set if valid
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
      setLoading(true);
      try {
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        const nearbyRes = await apiClient.get(`/listings?limit=100&page=1`);
        const nearbyData = nearbyRes.data;

        if (nearbyData.success) {
          const all = nearbyData.data?.listings || [];
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
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }, 500);
  }, [externalListings, onListingsChange]);

  // Handle geocoder selection — guard coords before setting flyTarget
  const handlePlaceSelect = (place) => {
    const center = safeCenter(place.lat, place.lng);
    if (center) {
      setFlyTarget(center);
      setFlyZoom(13);
    }
    geocoder.clear();
  };

  // Handle "my location"
  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = safeCenter(pos.coords.latitude, pos.coords.longitude);
        if (center) {
          setFlyTarget(center);
          setFlyZoom(13);
        }
      },
      () => { /* denied */ }
    );
  };

  // Only render markers for listings with valid coordinates
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

        {/* Only render FlyTo when flyTarget is valid */}
        {flyTarget && isValidLatLng(flyTarget[0], flyTarget[1]) && (
          <FlyTo center={flyTarget} zoom={flyZoom} />
        )}

        {geoListings.map((listing) => {
          const pos = getLatLng(listing);
          if (!pos) return null; // extra safety
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

      {/* ─── No listings overlay ─────────────────────────────── */}
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