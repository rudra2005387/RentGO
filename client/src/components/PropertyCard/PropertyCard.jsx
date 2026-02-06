import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaArrowRight, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PropertyCard = ({ listing, variants }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-64 flex-shrink-0">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        
        {/* Rating Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1 shadow-lg"
        >
          <FaStar className="text-yellow-400 text-sm" />
          <span className="font-bold text-gray-900 text-sm">{listing.rating}</span>
          <span className="text-xs text-gray-600">({listing.reviews})</span>
        </motion.div>

        {/* Favorite Button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorited(!isFavorited);
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <FaHeart className={`${isFavorited ? 'text-red-500' : 'text-gray-400'} transition-colors`} />
        </motion.button>

        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <Link to={`/listing/${listing.id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Quick View
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {listing.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4 flex-grow">
          <FaMapMarkerAlt className="mr-2 text-blue-600 flex-shrink-0 text-sm" />
          <span className="text-sm">{listing.location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600">Price per month</p>
            <span className="text-2xl font-bold text-blue-600">{listing.price}</span>
          </div>
          <Link to={`/listing/${listing.id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaArrowRight className="text-lg" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
