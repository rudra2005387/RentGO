import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaMapMarkerAlt, FaStar, FaMap, FaTh, FaSort } from 'react-icons/fa';
import FilterSidebar from '../components/filters/FilterSidebar';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import QuickViewModal from '../components/modals/QuickViewModal';
import Pagination from '../components/pagination/Pagination';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high, rating
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Sample properties data
  const allProperties = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      location: 'New York, NY',
      price: '$2,500/month',
      priceNum: 2500,
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
      type: 'Apartment',
      amenities: ['WiFi', 'Pool', 'Parking'],
      description: 'Beautiful modern apartment with stunning views'
    },
    {
      id: 2,
      title: 'Cozy Studio with Balcony',
      location: 'Los Angeles, CA',
      price: '$1,800/month',
      priceNum: 1800,
      rating: 4.9,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      type: 'Studio',
      amenities: ['WiFi', 'Kitchen'],
      description: 'Cozy studio perfect for single travelers'
    },
    {
      id: 3,
      title: 'Spacious 2BR Family Home',
      location: 'Chicago, IL',
      price: '$2,200/month',
      priceNum: 2200,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Kitchen', 'Garden'],
      description: 'Spacious family home with beautiful backyard'
    },
    {
      id: 4,
      title: 'Luxury Villa with Private Pool',
      location: 'Miami, FL',
      price: '$7,500/month',
      priceNum: 7500,
      rating: 4.9,
      reviews: 210,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
      type: 'Villa',
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
      description: 'Luxury villa with private pool and garden'
    },
    {
      id: 5,
      title: 'Charming Cottage in the Woods',
      location: 'Asheville, NC',
      price: '$1,900/month',
      priceNum: 1900,
      rating: 4.8,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1588880331179-b0b54b8acb9f?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Garden'],
      description: 'Charming cottage surrounded by nature'
    },
    {
      id: 6,
      title: 'Urban Loft with City Views',
      location: 'San Francisco, CA',
      price: '$3,200/month',
      priceNum: 3200,
      rating: 4.7,
      reviews: 192,
      image: 'https://images.unsplash.com/photo-1542914420-a332a4fb27d2?w=500&h=400&fit=crop',
      type: 'Apartment',
      amenities: ['WiFi', 'TV', 'Parking'],
      description: 'Modern loft with spectacular city views'
    },
    {
      id: 7,
      title: 'Beachfront Bungalow',
      location: 'Malibu, CA',
      price: '$5,000/month',
      priceNum: 5000,
      rating: 4.9,
      reviews: 231,
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Pool', 'Garden'],
      description: 'Exclusive beachfront property'
    },
    {
      id: 8,
      title: 'Ski-In/Ski-Out Chalet',
      location: 'Aspen, CO',
      price: '$6,800/month',
      priceNum: 6800,
      rating: 4.9,
      reviews: 199,
      image: 'https://images.unsplash.com/photo-1582494799538-8926955b9588?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Gym', 'Pool'],
      description: 'Luxury ski chalet with mountain views'
    },
    {
      id: 9,
      title: 'Trendy Room in Shared Apartment',
      location: 'Brooklyn, NY',
      price: '$1,200/month',
      priceNum: 1200,
      rating: 4.6,
      reviews: 87,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      type: 'Room',
      amenities: ['WiFi', 'Kitchen'],
      description: 'Trendy room in shared apartment'
    },
    {
      id: 10,
      title: 'Penthouse with Rooftop',
      location: 'Manhattan, NY',
      price: '$8,500/month',
      priceNum: 8500,
      rating: 5.0,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
      type: 'Apartment',
      amenities: ['WiFi', 'Gym', 'Pool', 'Parking'],
      description: 'Luxurious penthouse with panoramic views'
    },
    {
      id: 11,
      title: 'Victorian House',
      location: 'Boston, MA',
      price: '$2,800/month',
      priceNum: 2800,
      rating: 4.7,
      reviews: 142,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
      type: 'House',
      amenities: ['WiFi', 'Garden', 'Parking'],
      description: 'Historic Victorian house'
    },
    {
      id: 12,
      title: 'Modern Studio Downtown',
      location: 'Seattle, WA',
      price: '$1,600/month',
      priceNum: 1600,
      rating: 4.8,
      reviews: 119,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      type: 'Studio',
      amenities: ['WiFi', 'Kitchen'],
      description: 'Modern studio in downtown Seattle'
    }
  ];

  const [filteredProperties, setFilteredProperties] = useState(allProperties);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  // Handle filters
  const handleFilterChange = (filters) => {
    let filtered = allProperties;

    // Price filter
    filtered = filtered.filter(p => 
      p.priceNum >= filters.priceRange[0] && p.priceNum <= filters.priceRange[1]
    );

    // Property type filter
    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(p => filters.propertyType.includes(p.type));
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(p => 
        filters.amenities.some(a => p.amenities.includes(a))
      );
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (value) => {
    setSortBy(value);
    let sorted = [...filteredProperties];

    if (value === 'price-low') {
      sorted.sort((a, b) => a.priceNum - b.priceNum);
    } else if (value === 'price-high') {
      sorted.sort((a, b) => b.priceNum - a.priceNum);
    } else if (value === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProperties(sorted);
  };

  const toggleFavorite = (propertyId) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-600">Found {filteredProperties.length} properties</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block w-80 flex-shrink-0"
          >
            <FilterSidebar onFilterChange={handleFilterChange} />
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200'
                  }`}
                >
                  <FaTh className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200'
                  }`}
                >
                  <FaMap className="text-lg" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 flex items-center gap-2"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Grid/Map View */}
            {viewMode === 'grid' ? (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                  {displayedProperties.map(property => (
                    <motion.div
                      key={property.id}
                      variants={itemVariants}
                      className="relative"
                    >
                      <div
                        onMouseEnter={() => {
                          setSelectedProperty(property);
                          setQuickViewOpen(true);
                        }}
                      >
                        <PropertyCard
                          listing={property}
                          variants={itemVariants}
                        />
                      </div>

                      {/* Heart Button */}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(property.id)}
                        className={`absolute top-4 left-4 z-10 p-3 rounded-full transition-all ${
                          favorites.includes(property.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <FaHeart />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaMap className="text-6xl mx-auto mb-4 opacity-30" />
                  <p className="text-xl">Map view coming soon</p>
                  <p className="text-sm">Google Maps/Leaflet integration</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        property={selectedProperty}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </div>
  );
}

