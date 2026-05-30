// Advanced Search Filters Component
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaTimes, FaSlider } from 'react-icons/fa';
import { containerVariants, itemVariants } from '../../utils/animations';

export const AdvancedSearchFilters = ({ onFilter, isOpen, onClose }) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    amenities: [],
    propertyType: [],
    guests: 1,
  });

  const amenitiesList = [
    'WiFi', 'Kitchen', 'AC', 'Pool', 'Parking', 'Gym', 'Washer', 'Dryer', 
    'Heating', 'TV', 'Workstation', 'Balcony', 'Elevator', 'Breakfast'
  ];

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Studio', 'Townhouse'];

  const handleToggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleToggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type]
    }));
  };

  const handleApply = () => {
    onFilter(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 400, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl md:max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white p-4 md:p-6 border-b flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <FaFilter className="text-rose-500" />
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 md:p-6 space-y-6"
        >
          {/* Price Range */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaSlider className="text-rose-500 text-sm" />
              Price Range
            </h3>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </motion.div>

          {/* Rating */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="font-semibold text-gray-900 mb-4">Minimum Rating</h3>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.rating === rating
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}+⭐`}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Property Type */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="font-semibold text-gray-900 mb-4">Property Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleToggleType(type)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    filters.propertyType.includes(type)
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="font-semibold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    filters.amenities.includes(amenity)
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Guests */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h3 className="font-semibold text-gray-900 mb-4">Number of Guests</h3>
            <div className="flex gap-2">
              {[1, 2, 4, 6, 8].map((guests) => (
                <button
                  key={guests}
                  onClick={() => setFilters(prev => ({ ...prev, guests }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.guests === guests
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {guests}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white"
          >
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              Apply Filters
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedSearchFilters;
