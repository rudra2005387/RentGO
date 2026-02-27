import { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./PropertyCard.css";
const PropertyCard = ({ listing, variants }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4 }}
      className="property-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE SECTION */}
      <div className="property-image-container h-64">
        <img
          src={listing.image}
          alt={listing.title}
        />

        {/* Guest Favourite Badge (Optional - show conditionally if needed) */}
        {listing.isGuestFavourite && (
          <div className="guest-favourite-badge">
            Guest Favourite
          </div>
        )}

        {/* Favorite Heart */}
        <button
          className={`favorite-icon ${isFavorited ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsFavorited(!isFavorited);
          }}
        >
          <FaHeart />
        </button>

        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl"
        >
          <Link to={`/listing/${listing.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white px-5 py-2 rounded-lg font-semibold"
            >
              Quick View
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* PROPERTY INFO */}
      <div className="property-info">
        
        {/* Header Row: Location + Rating */}
        <div className="property-header">
          <div className="property-location line-clamp-1">
            {listing.location}
          </div>

          <div className="property-rating">
            <FaStar className="rating-star" />
            <span>{listing.rating}</span>
          </div>
        </div>

        {/* Title / Type */}
        <div className="property-title line-clamp-1">
          {listing.title}
        </div>

        {/* Description (Optional) */}
        {listing.description && (
          <div className="property-description">
            {listing.description}
          </div>
        )}

        {/* Pricing */}
        <div className="property-price">
          <span className="price-amount">{listing.price}</span>{" "}
          <span className="price-period">/ month</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;