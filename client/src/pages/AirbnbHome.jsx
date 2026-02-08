import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import AirbnbSearchBar from '../components/search/AirbnbSearchBar';
import AirbnbPropertyCard from '../components/AirbnbPropertyCard';

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
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
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
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
    },
    {
      id: 5,
      title: 'Cottage',
      location: 'Asheville, NC',
      price: 1900,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1588880331179-b0b54b8acb9f?w=500&h=400&fit=crop'
    },
    {
      id: 6,
      title: 'Urban Loft',
      location: 'San Francisco, CA',
      price: 3200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1542914420-a332a4fb27d2?w=500&h=400&fit=crop'
    },
    {
      id: 7,
      title: 'Beachfront Bungalow',
      location: 'Malibu, CA',
      price: 5000,
      rating: 4.9,
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
    },
    {
      id: 8,
      title: 'Mountain Chalet',
      location: 'Aspen, CO',
      price: 6800,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1582494799538-8926955b9588?w=500&h=400&fit=crop'
    }
  ];

  const categories = [
    { name: 'Cabins', icon: '🏡' },
    { name: 'Beachfront', icon: '🏖️' },
    { name: 'Trending', icon: '⭐' },
    { name: 'Pools', icon: '🏊' },
    { name: 'Countryside', icon: '🌄' },
    { name: 'Islands', icon: '🏝️' },
    { name: 'Luxury', icon: '💎' },
    { name: 'Camping', icon: '⛺' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-b from-gray-50 to-white pt-20 pb-16 md:pt-32 md:pb-24"
      >
        <div className="container space-y-12">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
              Not sure where to go? Perfect.
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Explore thousands of unique properties. Book with confidence and enjoy your stay.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full flex justify-center"
          >
            <AirbnbSearchBar onSearch={handleSearch} variant="hero" />
          </motion.div>
        </div>
      </motion.section>

      {/* ====== CATEGORY FILTERS ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="border-b border-[#EBEBEB] category-filters-container"
      >
        <div className="category-filters-wrapper">
          <div className="container py-8 category-filters">
            <div className="category-scroll-container">
              {categories.map((cat, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="category-item"
                >
                  <span className="category-icon text-2xl">{cat.icon}</span>
                  <span className="category-label">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ====== POPULAR HOMES SECTION ====== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="border-b border-[#EBEBEB]"
      >
        <div className="container section-lg">
          {/* Section Header */}
          <div className="section-header mb-6">
            <div>
              <h2 className="section-title">Popular homes in Your Area</h2>
              <p className="section-subtitle">Discover the best-rated properties near you</p>
            </div>
            <a href="/search" className="view-all-link">
              View all <FaArrowRight className="text-lg" />
            </a>
          </div>

          {/* Property Grid */}
          <div className="property-grid">
            {featuredListings.map((listing) => (
              <AirbnbPropertyCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listing/${listing.id}`)}
              />
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
        className="border-b border-[#EBEBEB] why-choose-section"
      >
        <div className="why-choose-container">
          <div className="why-choose-header">
            <h2>Why Choose RentGo?</h2>
            <p>Everything you need for the perfect stay</p>
          </div>

          <div className="features-grid">
            {[
              { icon: '🔒', title: 'Secure Booking', desc: 'Your payment is protected with our secure payment system' },
              { icon: '⭐', title: 'Verified Hosts', desc: 'All hosts are verified and reviewed by our community' },
              { icon: '💬', title: '24/7 Support', desc: 'Round-the-clock customer support for any issues' },
              { icon: '✨', title: 'Best Deals', desc: 'Exclusive discounts and offers for loyal members' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                className="feature-card"
              >
                <div className="feature-icon-container"><span style={{fontSize:28}}>{feature.icon}</span></div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
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
        className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative container section-lg text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Ready to Find Your Perfect Stay?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl opacity-90 max-w-2xl mx-auto mb-10"
          >
            Join thousands of travelers who trust RentGo for their perfect getaway.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="/search" className="btn btn-lg bg-white text-[#FF385C] hover:bg-gray-100">
              Explore Properties <FaArrowRight />
            </a>
            <a href="/register" className="btn btn-lg border-2 border-white hover:bg-white/10">
              Create Account
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Safety</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Community</h3>
              <ul className="footer-links">
                <li><a href="#">Become a Host</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Resources</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Sitemap</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p className="footer-copyright">© 2025 RentGo. All rights reserved.</p>
              <div className="footer-legal-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Preferences</a>
              </div>
            </div>

            <div className="footer-bottom-right">
              <div className="social-icons">
                <div className="social-icon">F</div>
                <div className="social-icon">I</div>
                <div className="social-icon">T</div>
              </div>
              <div className="footer-settings">
                <div className="footer-setting">Language</div>
                <div className="footer-setting">Currency</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AirbnbHome;
