import { useState } from "react";
import { FaStar, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import "./AirbnbPropertyCard.css";

const AirbnbPropertyCard = ({ listing = {}, onClick }) => {
  const [isFav, setIsFav] = useState(false);

  if (!listing) return null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="airbnb-card"
    >
      {/* IMAGE */}
      <div className="airbnb-card-image">
        <img
          src={listing.image || "https://via.placeholder.com/500x400"}
          alt={listing.title || "Property"}
        />

        {listing.badge && (
          <div className="airbnb-badge">
            {listing.badge}
          </div>
        )}

        <button
          className={`airbnb-heart ${isFav ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsFav(!isFav);
          }}
        >
          <FaHeart />
        </button>
      </div>

      {/* INFO */}
      <div className="airbnb-card-info">
        <div className="airbnb-card-header">
          <span className="airbnb-location">
            {listing.location || "Unknown location"}
          </span>

          <span className="airbnb-rating">
            <FaStar /> {listing.rating || 0}
          </span>
        </div>

        <h3 className="airbnb-title">
          {listing.title || "Untitled Property"}
        </h3>

        <div className="airbnb-price">
          ₹{listing.price ? listing.price.toLocaleString() : "0"}{" "}
          <span>/ night</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AirbnbPropertyCard;