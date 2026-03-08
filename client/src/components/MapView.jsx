import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPriceIcon } from './PricePin';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix default Leaflet marker icon issue (missing images with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component that triggers fetches when viewport changes
function ViewportWatcher({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      onBoundsChange({
        center: { lat: center.lat, lng: center.lng },
        bounds: {
          ne: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
          sw: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        },
      });
    },
  });
  return null;
}

// Recenter map when the center prop changes
function RecenterMap({ center }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (
      center &&
      (center[0] !== prevCenter.current[0] || center[1] !== prevCenter.current[1])
    ) {
      map.setView(center, map.getZoom());
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

// Popup card for a listing
function ListingPopupCard({ listing }) {
  const img = listing.images?.[0]?.url || listing.images?.[0];
  const price = listing.pricing?.basePrice || listing.price;
  const city = listing.location?.city || '';

  return (
    <Link
      to={`/listing/${listing._id}`}
      className="block w-56 no-underline text-inherit"
    >
      <div className="rounded-xl overflow-hidden bg-white shadow-sm">
        {img && (
          <img
            src={img}
            alt={listing.title}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        )}
        <div className="p-3">
          <p className="text-sm font-semibold text-[#222222] truncate">{listing.title}</p>
          <p className="text-xs text-[#717171]">{city}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-[#222222]">${price}<span className="font-normal text-[#717171]">/night</span></span>
            {listing.averageRating && (
              <span className="flex items-center gap-1 text-xs text-[#222222]">
                <FaStar className="text-yellow-400" size={10} />
                {listing.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MapView({ listings: externalListings, city, className = '' }) {
  const [listings, setListings] = useState(externalListings || []);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchTimeoutRef = useRef(null);

  // Default center: use first listing coords, or fallback to NYC
  const defaultCenter = (() => {
    if (externalListings?.length) {
      const first = externalListings[0];
      const coords = first.location?.coordinates;
      if (coords?.length === 2) return [coords[1], coords[0]]; // GeoJSON [lng, lat] → [lat, lng]
      if (first.location?.lat && first.location?.lng) return [first.location.lat, first.location.lng];
    }
    return [40.7128, -74.006]; // NYC fallback
  })();

  // Sync with external listings if provided
  useEffect(() => {
    if (externalListings?.length) setListings(externalListings);
  }, [externalListings]);

  // Fetch listings when viewport changes (only if no external listings)
  const handleBoundsChange = useCallback(
    ({ bounds }) => {
      if (externalListings?.length) return; // use parent-provided data

      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            minLat: bounds.sw.lat,
            maxLat: bounds.ne.lat,
            minLng: bounds.sw.lng,
            maxLng: bounds.ne.lng,
            limit: '100',
          });
          if (city) params.set('city', city);
          const res = await fetch(`${API_BASE}/listings?${params}`);
          const d = await res.json();
          if (d.success) {
            setListings(d.data?.listings || []);
          }
        } catch {
          // silent
        } finally {
          setLoading(false);
        }
      }, 400); // debounce 400ms
    },
    [externalListings, city]
  );

  // Get [lat, lng] from a listing
  const getLatLng = (listing) => {
    const coords = listing.location?.coordinates;
    if (coords?.length === 2) return [coords[1], coords[0]];
    if (listing.location?.lat && listing.location?.lng) return [listing.location.lat, listing.location.lng];
    return null;
  };

  const geoListings = listings.filter((l) => getLatLng(l) !== null);

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-[#222222]">
          Loading listings...
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '400px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportWatcher onBoundsChange={handleBoundsChange} />
        <RecenterMap center={defaultCenter} />

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
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-[500]">
          <div className="text-center">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-sm font-semibold text-[#222222]">No listings with location data</p>
            <p className="text-xs text-[#717171]">Try a different search area</p>
          </div>
        </div>
      )}
    </div>
  );
}
