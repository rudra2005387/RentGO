import { useState } from 'react';
import { FaWifi, FaSwimmer, FaUtensils, FaTv, FaWind, FaRecycle, FaParking, FaTree, FaDumbbell, FaShieldAlt } from 'react-icons/fa';

const AmenitiesFilter = ({ selected = [], onChange }) => {
  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: <FaWifi /> },
    { id: 'pool', label: 'Pool', icon: <FaSwimmer /> },
    { id: 'kitchen', label: 'Kitchen', icon: <FaUtensils /> },
    { id: 'tv', label: 'TV', icon: <FaTv /> },
    { id: 'ac', label: 'Air Conditioning', icon: <FaWind /> },
    { id: 'washer', label: 'Washer', icon: <FaRecycle /> },
    { id: 'parking', label: 'Parking', icon: <FaParking /> },
    { id: 'garden', label: 'Garden', icon: <FaTree /> },
    { id: 'gym', label: 'Gym', icon: <FaDumbbell /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> }
  ];

  const handleToggle = (amenityId) => {
    const updated = selected.includes(amenityId)
      ? selected.filter(a => a !== amenityId)
      : [...selected, amenityId];
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {amenities.map(amenity => (
        <label
          key={amenity.id}
          className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <input
            type="checkbox"
            checked={selected.includes(amenity.id)}
            onChange={() => handleToggle(amenity.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <span className="text-lg text-gray-700">{amenity.icon}</span>
          <span className="text-sm font-semibold text-gray-700">{amenity.label}</span>
        </label>
      ))}
    </div>
  );
};

export default AmenitiesFilter;
