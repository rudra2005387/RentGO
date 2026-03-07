import { useState } from 'react';
import {
  FaBuilding,
  FaHome,
  FaDoorOpen,
  FaWarehouse,
  FaUmbrellaBeach,
  FaMountain,
  FaCampground
} from 'react-icons/fa';

const categories = [
  { id: 'all', name: 'All', icon: <FaHome /> },
  { id: 'apartments', name: 'Apartments', icon: <FaBuilding /> },
  { id: 'houses', name: 'Houses', icon: <FaHome /> },
  { id: 'rooms', name: 'Rooms', icon: <FaDoorOpen /> },
  { id: 'studios', name: 'Studios', icon: <FaWarehouse /> },
  { id: 'beach', name: 'Beach', icon: <FaUmbrellaBeach /> },
  { id: 'mountain', name: 'Mountain', icon: <FaMountain /> },
  { id: 'camping', name: 'Camping', icon: <FaCampground /> }
];

const CategoryFilter = ({ onChange }) => {
  const [selected, setSelected] = useState('all');

  const handleSelect = (value) => {
    setSelected(value);
    if (onChange) onChange(value);
  };

  return (
    <div className="flex flex-row gap-8 overflow-x-auto border-b border-[#DDDDDD] px-10 py-3 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className={`flex flex-col items-center gap-1 cursor-pointer pb-2 transition-all whitespace-nowrap ${
            selected === category.id
              ? 'opacity-100 border-b-2 border-[#222222]'
              : 'opacity-60 hover:opacity-100 border-b-2 border-transparent'
          }`}
        >
          <span className="text-2xl">{category.icon}</span>
          <span className="text-xs font-medium text-[#717171]">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
