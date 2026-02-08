
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaKey, FaShieldAlt, FaUsers, FaArrowRight, FaStar, FaMapMarkerAlt, FaWifi, FaTv, FaUtensils, FaParking } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdvancedSearchBar from '../components/search/AdvancedSearchBar.jsx';

const Home = () => {
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
      price: '$2,500/month',
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
    },
    {
      id: 2,
      title: 'Cozy Studio',
      location: 'Los Angeles, CA',
      price: '$1,800/month',
      rating: 4.9,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop'
    },
    {
      id: 3,
      title: 'Family Home',
      location: 'Chicago, IL',
      price: '$2,200/month',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop'
    },
    {
      id: 4,
      title: 'Luxury Villa',
      location: 'Miami, FL',
      price: '$7,500/month',
      rating: 4.9,
      reviews: 210,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
    },
    {
      id: 5,
      title: 'Cottage',
      location: 'Asheville, NC',
      price: '$1,900/month',
      rating: 4.8,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1588880331179-b0b54b8acb9f?w=500&h=400&fit=crop'
    },
    {
      id: 6,
      title: 'Urban Loft',
      location: 'San Francisco, CA',
      price: '$3,200/month',
      rating: 4.7,
      reviews: 192,
      image: 'https://images.unsplash.com/photo-1542914420-a332a4fb27d2?w=500&h=400&fit=crop'
    },
    {
      id: 7,
      title: 'Beachfront Bungalow',
      location: 'Malibu, CA',
      price: '$5,000/month',
      rating: 4.9,
      reviews: 231,
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
    },
    {
      id: 8,
      title: 'Mountain Chalet',
      location: 'Aspen, CO',
      price: '$6,800/month',
      rating: 4.9,
      reviews: 199,
      image: 'https://images.unsplash.com/photo-1582494799538-8926955b9588?w=500&h=400&fit=crop'
    }
  ];

  const features = [
    { icon: <FaKey className="w-8 h-8" />, title: 'Easy Booking', desc: 'Book in minutes' },
    { icon: <FaShieldAlt className="w-8 h-8" />, title: 'Secure Payment', desc: 'Protected transactions' },
    { icon: <FaUsers className="w-8 h-8" />, title: 'Trusted Hosts', desc: 'Verified listings' },
    { icon: <FaHome className="w-8 h-8" />, title: 'Wide Selection', desc: '10,000+ properties' }
  ];

  const testimonials = [
    { name: 'Sarah Johnson', text: 'Found my apartment in 2 days. Amazing!', rating: 5 },
    { name: 'Mike Chen', text: 'Best rental platform ever.', rating: 5 },
    { name: 'Emily Davis', text: 'Excellent experience. Highly recommended!', rating: 5 }
  ];

  const categories = [
    { name: 'Apartments', count: '2,340' },
    { name: 'Houses', count: '1,890' },
    { name: 'Villas', count: '450' },
    { name: 'Studios', count: '3,120' }
  ];

  return (

    
    <div className="bg-white min-h-screen">
      {/* ====== HERO — TWO COLUMN (LEFT: VALUE + SEARCH, RIGHT: IMAGE) ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white"
      >
        <div className="hero-two-column">
          {/* Left panel: headline, copy, search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-panel"
          >
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Find Your Perfect Home Away From Home
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Explore thousands of unique properties. Search, book, and travel with confidence.
              </p>

              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                <AdvancedSearchBar onSearch={handleSearch} variant="hero" />
              </div>
            </div>
          </motion.div>

          {/* Right panel: immersive image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-image-wrap"
          >
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop"
              alt="Vacation Destination"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ====== PROPERTY TYPES SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container py-20 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Explore by Type</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Apartments', count: '2,340', icon: '🏢' },
              { name: 'Houses', count: '1,890', icon: '🏠' },
              { name: 'Villas', count: '450', icon: '✨' },
              { name: 'Studios', count: '3,120', icon: '🎨' }
            ].map((cat, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-blue-600 rounded-xl hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <p className="font-bold text-gray-900 text-lg">{cat.name}</p>
                <p className="text-sm text-gray-500 mt-2">{cat.count}+ properties</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== FEATURED PROPERTIES SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container py-20 sm:py-24 lg:py-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                Explore Dream Destinations
              </h2>
              <p className="text-xl text-gray-600">Handpicked properties from around the world</p>
            </motion.div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap"
            >
              See All <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured Properties Grid */}
          <div className="listings-grid">
            {featuredListings.map((listing, idx) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="listing-card">
                  <div className="card-image">
                    <img
                      src={listing.image}
                      alt={listing.title}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {listing.rating}
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-4">
                      <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" /> {listing.location}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <span className="font-medium text-gray-900">{listing.rating}</span>
                      <span>({listing.reviews} reviews)</span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 mb-4">{listing.price}</p>

                    <div className="flex flex-wrap gap-2 mb-4 flex-1">
                      {[FaWifi, FaTv, FaUtensils, FaParking].slice(0, 2).map((IconComponent, i) => (
                        <span key={i} className="text-gray-600 text-sm">
                          <IconComponent className="w-4 h-4" />
                        </span>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-auto"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== WHY RENTGO SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container py-20 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Why Choose RentGo?
            </h2>
            <p className="text-xl text-gray-600">Complete peace of mind for your next stay</p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== TESTIMONIALS SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container py-20 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Loved by Millions
            </h2>
            <p className="text-xl text-gray-600">Real stories from happy guests</p>
          </motion.div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 leading-relaxed italic text-lg">
                  "{testimonial.text}"
                </p>

                {/* Name */}
                <p className="font-bold text-gray-900">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== CTA SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative container py-20 sm:py-24 lg:py-32 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Ready to Book Your Next Stay?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
          >
            Join millions of travelers who trust RentGo for their perfect getaway.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-colors duration-300 shadow-lg text-lg"
            >
              Browse Properties <FaArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-blue-700 font-bold py-4 px-10 rounded-xl transition-colors duration-300 text-lg"
            >
              Create Account
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 pt-12 border-t border-white/20 flex flex-col sm:flex-row justify-center gap-8 text-center sm:text-left"
          >
            <div>
              <p className="text-3xl font-bold">50M+</p>
              <p className="text-blue-100 text-sm">Guests Hosted</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-blue-100 text-sm">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold">195+</p>
              <p className="text-blue-100 text-sm">Countries</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-800"
          >
            {/* About */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">How it works</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Become a Host</a></li>
                <li><a href="#" className="hover:text-white transition">Community Center</a></li>
                <li><a href="#" className="hover:text-white transition">Resources</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Sitemap</a></li>
              </ul>
            </div>
          </motion.div>

          {/* Bottom Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500"
          >
            <p>&copy; 2025 RentGo. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition">Cookie Preferences</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
