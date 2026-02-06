import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaHome, FaDoorOpen, FaWarehouse, FaAllergies } from 'react-icons/fa';
import clsx from 'clsx';

const categories = [
  { id: 'all', name: 'All Types', icon: <FaHome /> },
  { id: 'apartments', name: 'Apartments', icon: <FaBuilding /> },
  { id: 'houses', name: 'Houses', icon: <FaHome /> },
  { id: 'rooms', name: 'Rooms', icon: <FaDoorOpen /> },
  { id: 'studios', name: 'Studios', icon: <FaWarehouse /> },
];

const CategoryFilter = () => {
  const [selected, setSelected] = useState('all');

  return (
    <div className="w-full flex flex-wrap items-center justify-start md:justify-center gap-2 md:gap-3 px-0">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          onClick={() => setSelected(category.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={clsx(
            'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base shadow-sm hover:shadow-md',
            {
              'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-2 border-blue-600': selected === category.id,
              'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50': selected !== category.id,
            }
          )}
        >
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-lg md:text-xl"
          >
            {category.icon}
          </motion.span>
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
