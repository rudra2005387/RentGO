import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa';

export default function AirbnbPropertyCard({ listing, onClick }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div className="card-image-wrapper relative w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-3">
        <img
          src={listing.image}
          alt={listing.title}
          className="card-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xl text-white transition-all hover:bg-black/30 z-10"
        >
          {isSaved ? (
            <FaHeart className="text-[#FF385C]" />
          ) : (
            <FaRegHeart />
          )}
        </button>

        {/* Badge */}
        {listing.badge && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-black shadow-sm">
            {listing.badge}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="space-y-1">
        {/* Location & Rating Row */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-semibold text-black line-clamp-1">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 whitespace-nowrap card-rating">
            <FaStar size={14} className="text-black" />
            <span className="text-sm font-medium text-black">{listing.rating}</span>
          </div>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600">
          {listing.location}
        </p>

        {/* Dates */}
        {listing.dates && (
          <p className="text-sm text-gray-600">
            {listing.dates}
          </p>
        )}

        {/* Price */}
        <div className="pt-2">
          <p className="text-sm">
            <span className="card-price-value">${listing.price}</span>
            <span className="text-gray-600"> per night</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
