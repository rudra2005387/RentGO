import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import AirbnbSearchBar from '../components/search/AirbnbSearchBar';
import PropertyCard from '../components/PropertyCard/PropertyCard';

const AirbnbHome = () => {
  const navigate = useNavigate();

  const handleSearch = (searchParams) => {
    const query = new URLSearchParams({
      location: searchParams.location || '',
      checkIn: searchParams.checkIn || '',
      checkOut: searchParams.checkOut || '',
      guests: searchParams.guests || 1
    }).toString();

    navigate(`/search?${query}`);
  };

  const featuredListings = [
    {
      id: 1,
      title: 'Modern Apartment',
      location: 'New York, NY',
      price: 2500,
      rating: 4.8,
      badge: 'Guest favourite',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop'
    },
    {
      id: 2,
      title: 'Cozy Studio',
      location: 'Los Angeles, CA',
      price: 1800,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop'
    },
    {
      id: 3,
      title: 'Family Home',
      location: 'Chicago, IL',
      price: 2200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop'
    },
    {
      id: 4,
      title: 'Luxury Villa',
      location: 'Miami, FL',
      price: 7500,
      rating: 4.9,
      badge: 'Superhost',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop'
    }
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-b from-gray-50 to-white pt-24 pb-20"
      >
        <div className="container text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Not sure where to go? Perfect.
          </h1>
          <p className="text-gray-600 text-lg">
            Explore thousands of unique properties. Book with confidence.
          </p>

          <div className="flex justify-center">
            <AirbnbSearchBar onSearch={handleSearch} variant="hero" />
          </div>
        </div>
      </motion.section>

      {/* POPULAR HOMES */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                Popular homes in Your Area
              </h2>
              <p className="text-gray-600">
                Discover the best-rated properties near you
              </p>
            </div>

            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-blue-600 font-semibold"
            >
              View all <FaArrowRight />
            </button>
          </div>

          {/* PROPERTY GRID */}
          <div className="property-grid">
            {featuredListings.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listing/${listing.id}`)}
              />
            ))}
          </div>

        </div>
      </motion.section>

    </div>
  );
};

export default AirbnbHome;