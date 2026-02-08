import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaMapMarkerAlt, FaStar, FaSliders, FaArrowUp, FaArrowDown, FaWifi, FaUtensilsSpoon, FaParking, FaTv } from 'react-icons/fa';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter states
  const [priceRange, setPriceRange] = useState([1000, 10000]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Sample properties
  const allProperties = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      location: 'New York, NY',
      price: 2500,
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
      type: 'Apartment',
      amenities: ['WiFi', 'Pool', 'Parking', 'Kitchen'],
      bedrooms: 2,
      bathrooms: 1,
      guests: 4
    },
    {
      id: 2,
      title: 'Cozy Studio with Balcony',
      location: 'Los Angeles, CA',
      price: 1800,
      rating: 4.9,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      type: 'Studio',
      amenities: ['WiFi', 'Kitchen'],
      bedrooms: 1,
      bathrooms: 1,
      guests: 2
    },
    {
      id: 3,
      title: 'Spacious 2BR Family Home',
      location: 'Chicago, IL',
      price: 2200,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Kitchen', 'Garden', 'Parking'],
      bedrooms: 2,
      bathrooms: 2,
      guests: 5
    },
    {
      id: 4,
      title: 'Luxury Villa with Private Pool',
      location: 'Miami, FL',
      price: 7500,
      rating: 4.9,
      reviews: 210,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
      type: 'Villa',
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen'],
      bedrooms: 4,
      bathrooms: 3,
      guests: 8
    },
    {
      id: 5,
      title: 'Charming Cottage in the Woods',
      location: 'Asheville, NC',
      price: 1900,
      rating: 4.8,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1588880331179-b0b54b8acb9f?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Garden', 'TV'],
      bedrooms: 2,
      bathrooms: 1,
      guests: 4
    },
    {
      id: 6,
      title: 'Urban Loft with City Views',
      location: 'San Francisco, CA',
      price: 3200,
      rating: 4.7,
      reviews: 192,
      image: 'https://images.unsplash.com/photo-1542914420-a332a4fb27d2?w=500&h=400&fit=crop',
      type: 'Apartment',
      amenities: ['WiFi', 'TV', 'Parking', 'Kitchen'],
      bedrooms: 1,
      bathrooms: 1,
      guests: 2
    },
    {
      id: 7,
      title: 'Beachfront Bungalow',
      location: 'Malibu, CA',
      price: 5000,
      rating: 4.9,
      reviews: 231,
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Pool', 'Garden', 'Kitchen'],
      bedrooms: 3,
      bathrooms: 2,
      guests: 6
    },
    {
      id: 8,
      title: 'Ski-In/Ski-Out Chalet',
      location: 'Aspen, CO',
      price: 6800,
      rating: 4.9,
      reviews: 199,
      image: 'https://images.unsplash.com/photo-1582494799538-8926955b9588?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Gym', 'Pool', 'Kitchen'],
      bedrooms: 4,
      bathrooms: 2,
      guests: 8
    },
  ];

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Room'];
  const amenityOptions = ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Gym', 'Garden', 'TV'];

  // Filter properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      const matchPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(property.type);
      const matchAmenities = selectedAmenities.length === 0 || selectedAmenities.every(a => property.amenities.includes(a));
      const matchRating = property.rating >= minRating;
      return matchPrice && matchType && matchAmenities && matchRating;
    });
  }, [priceRange, selectedTypes, selectedAmenities, minRating]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [filteredProperties, sortBy]);

  const handlePropertySelect = (propertyId) => {
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      setFavorites([...favorites, propertyId]);
    }
  };

  const amenityIcons = {
    'WiFi': <FaWifi className="w-4 h-4" />,
    'Kitchen': <FaUtensilsSpoon className="w-4 h-4" />,
    'Parking': <FaParking className="w-4 h-4" />,
    'TV': <FaTv className="w-4 h-4" />,
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Search Results
              </h1>
              <p className="text-gray-600 mt-1">
                {sortedProperties.length} properties found
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <FaSliders className="w-4 h-4" />
                <span>Filters</span>
              </motion.button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="sticky top-24 space-y-6">
                {/* Price Range */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">
                        Minimum: ${priceRange[0].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = Math.min(parseInt(e.target.value), priceRange[1]);
                          setPriceRange([newMin, priceRange[1]]);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Maximum: ${priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Math.max(parseInt(e.target.value), priceRange[0]);
                          setPriceRange([priceRange[0], newMax]);
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Property Type</h3>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Amenities</h3>
                  <div className="space-y-2">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 4.5, 4.7, 4.8, 4.9].map((rating) => (
                      <label key={rating} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-gray-700">{rating}★ & up</span>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === 0}
                        onChange={() => setMinRating(0)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-gray-700">All ratings</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Properties Grid */}
          <motion.div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProperties.map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePropertySelect(property.id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <FaHeart
                          className={`w-5 h-5 ${
                            favorites.includes(property.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600'
                          }`}
                        />
                      </motion.button>

                      {/* Rating Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold">
                        ⭐ {property.rating}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm">
                        {property.title}
                      </h3>
                      
                      <p className="text-xs text-gray-600 flex items-center gap-1 mb-3">
                        <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                        {property.location}
                      </p>

                      {/* Room Details */}
                      <div className="flex gap-3 text-xs text-gray-600 mb-3">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        <span>{property.guests} guests</span>
                      </div>

                      {/* Amenities Icons */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {property.amenities.slice(0, 2).map((amenity) => (
                          <div key={amenity} className="text-gray-600 text-xs">
                            {amenityIcons[amenity] || amenity}
                          </div>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xl font-bold text-gray-900">
                          ${property.price.toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          ({property.reviews} reviews)
                        </p>
                      </div>

                      {/* View Details Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {sortedProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-lg text-gray-600">No properties match your filters.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setPriceRange([1000, 10000]);
                    setSelectedTypes([]);
                    setSelectedAmenities([]);
                    setMinRating(0);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;

