import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PriceRangeSlider from './PriceRangeSlider';
import AmenitiesFilter from './AmenitiesFilter';

const FilterSidebar = ({ onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    propertyType: true,
    amenities: true,
    rating: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    propertyType: [],
    amenities: [],
    minRating: 0
  });

  const propertyTypes = ['Apartments', 'Houses', 'Rooms', 'Studios', 'Villas'];
  const ratingOptions = [4.5, 4.0, 3.5, 3.0];

  const handlePriceChange = (range) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
    onFilterChange({ ...filters, priceRange: range });
  };

  const handlePropertyTypeChange = (type) => {
    setFilters(prev => {
      const updated = prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type];
      onFilterChange({ ...filters, propertyType: updated });
      return { ...prev, propertyType: updated };
    });
  };

  const handleAmenitiesChange = (amenities) => {
    setFilters(prev => ({ ...prev, amenities }));
    onFilterChange({ ...filters, amenities });
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
    onFilterChange({ ...filters, minRating: rating });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Price Filter */}
      <div>
        <motion.button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-bold text-lg text-gray-900 mb-4"
        >
          <span>Price Range</span>
          {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
        {expandedSections.price && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <PriceRangeSlider
              value={filters.priceRange}
              onChange={handlePriceChange}
              min={0}
              max={10000}
            />
          </motion.div>
        )}
      </div>

      {/* Property Type Filter */}
      <div>
        <motion.button
          onClick={() => toggleSection('propertyType')}
          className="w-full flex items-center justify-between font-bold text-lg text-gray-900 mb-4"
        >
          <span>Property Type</span>
          {expandedSections.propertyType ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
        {expandedSections.propertyType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {propertyTypes.map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.propertyType.includes(type)}
                  onChange={() => handlePropertyTypeChange(type)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="text-gray-700">{type}</span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Amenities Filter */}
      <div>
        <motion.button
          onClick={() => toggleSection('amenities')}
          className="w-full flex items-center justify-between font-bold text-lg text-gray-900 mb-4"
        >
          <span>Amenities</span>
          {expandedSections.amenities ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
        {expandedSections.amenities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <AmenitiesFilter
              selected={filters.amenities}
              onChange={handleAmenitiesChange}
            />
          </motion.div>
        )}
      </div>

      {/* Rating Filter */}
      <div>
        <motion.button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between font-bold text-lg text-gray-900 mb-4"
        >
          <span>Rating</span>
          {expandedSections.rating ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
        {expandedSections.rating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {ratingOptions.map(rating => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <span className="text-gray-700">⭐ {rating}+ stars</span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Reset Filters */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setFilters({
            priceRange: [0, 10000],
            propertyType: [],
            amenities: [],
            minRating: 0
          });
          onFilterChange({
            priceRange: [0, 10000],
            propertyType: [],
            amenities: [],
            minRating: 0
          });
        }}
        className="w-full py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
      >
        Reset Filters
      </motion.button>
    </div>
  );
};

export default FilterSidebar;
