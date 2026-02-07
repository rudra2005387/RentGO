import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const QuickViewModal = ({ property, isOpen, onClose }) => {
  if (!isOpen || !property) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-64 object-cover rounded-lg"
          />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-semibold text-gray-900">{property.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price per Month</p>
              <p className="text-lg font-bold text-blue-600">{property.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-lg font-semibold text-gray-900">⭐ {property.rating} ({property.reviews} reviews)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Property Type</p>
              <p className="text-lg font-semibold text-gray-900">{property.type || 'Apartment'}</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map(amenity => (
                  <p key={amenity} className="text-gray-700">✓ {amenity}</p>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Full Details
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickViewModal;
