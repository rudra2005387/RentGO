import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./PropertyCard.css";

const PropertyCard = ({ listing, isWishlisted = false, onWishlistToggle }) => {
  const images = listing.images?.length ? listing.images : [listing.image];
  const [activeImage, setActiveImage] = useState(0);

  const showNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const showPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/listing/${listing.id}`} className="property-card group">
      {/* IMAGE */}
      <div className="property-image-container">
        <img
          src={images[activeImage]}
          alt={listing.title}
          className="group-hover:brightness-95 transition-all"
        />

        {/* Heart — no background, white with drop shadow */}
        <button
          className={`wishlist-heart ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onWishlistToggle) onWishlistToggle(listing);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          {isWishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Guest Favourite Badge */}
        {listing.isGuestFavourite && (
          <div className="guest-favourite-badge">
            Guest favourite
          </div>
        )}

        {/* Carousel arrows — shown on hover via CSS */}
        {images.length > 1 && (
          <>
            <button
              className="image-nav image-nav-left"
              onClick={showPrev}
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <button
              className="image-nav image-nav-right"
              onClick={showNext}
              aria-label="Next image"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="image-dots" aria-hidden="true">
            {images.map((_, index) => (
              <span
                key={`${listing.id}-dot-${index}`}
                className={`image-dot ${index === activeImage ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* INFO — plain text below image, no card wrapper */}
      <div className="property-info">
        <div className="property-header">
          <span className="property-location">{listing.location}</span>
          <span className="property-rating">
            <FaStar />
            {listing.rating?.toFixed?.(1) || listing.rating}
          </span>
        </div>
        <div className="property-title">{listing.title}</div>
        <div className="property-price">
          <span className="price-amount">{listing.price}</span>
          <span className="price-period"> / month</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;