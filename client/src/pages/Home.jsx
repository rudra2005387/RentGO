
import { motion } from 'framer-motion';
import { FaHome, FaKey, FaShieldAlt, FaUsers, FaArrowRight, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import SearchBar from '../components/SearchBar/SearchBar';

const Home = () => {
  

  const featuredListings = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      location: 'New York, NY',
      price: '$2,500/month',
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
      isNew: true
    },
    {
      id: 2,
      title: 'Cozy Studio with Balcony',
      location: 'Los Angeles, CA',
      price: '$1,800/month',
      rating: 4.9,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop'
    },
    {
      id: 3,
      title: 'Spacious 2BR Family Home',
      location: 'Chicago, IL',
      price: '$2,200/month',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop'
    },
    {
        id: 4,
        title: 'Luxury Villa with Private Pool',
        location: 'Miami, FL',
        price: '$7,500/month',
        rating: 4.9,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
        isNew: true
    },
    {
        id: 5,
        title: 'Charming Cottage in the Woods',
        location: 'Asheville, NC',
        price: '$1,900/month',
        rating: 4.8,
        reviews: 178,
        image: 'https://images.unsplash.com/photo-1588880331179-b0b54b8acb9f?w=500&h=400&fit=crop'
    },
    {
        id: 6,
        title: 'Urban Loft with City Views',
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
        isNew: true
    },
    {
        id: 8,
        title: 'Ski-In/Ski-Out Chalet',
        location: 'Aspen, CO',
        price: '$6,800/month',
        rating: 4.9,
        reviews: 199,
        image: 'https://images.unsplash.com/photo-1582494799538-8926955b9588?w=500&h=400&fit=crop'
    }
  ];

  const features = [
    {
      icon: <FaKey className="text-3xl" />,
      title: 'Easy Booking',
      description: 'Find and book your perfect home in just a few clicks'
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Secure & Safe',
      description: 'Verified properties and protected transactions'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Trusted Community',
      description: 'Thousands of happy renters and property owners'
    },
    {
      icon: <FaHome className="text-3xl" />,
      title: 'Wide Selection',
      description: 'Browse thousands of properties nationwide'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Properties' },
    { number: '50K+', label: 'Happy Renters' },
    { number: '4.8★', label: 'Average Rating' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            variants={itemVariants} 
            initial="hidden" 
            animate="visible"
            className="z-10"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
            >
              Welcome to RentGo
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Home</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover thousands of properties. Easy booking, secure transactions, and a trusted community of renters and landlords.
            </p>
            
            <SearchBar />

            {/* Quick Features */}
            <div className="flex flex-col gap-3">
              {[
                'Verified properties and landlords',
                'Secure payment methods',
                'No hidden fees'
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Hero Image */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=600&fit=crop"
                alt="Modern apartment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Why Choose RentGo?
            </motion.h2>
            <p className="text-xl text-gray-600">Everything you need for a seamless rental experience</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="p-8 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Listings Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Featured Properties</h2>
              <p className="text-xl text-gray-600">Handpicked homes for you</p>
            </div>
            <Link
              to="/search"
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 whitespace-nowrap"
            >
              View All <FaArrowRight />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {featuredListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} variants={itemVariants} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to find your dream home</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Search', desc: 'Browse properties by location and price' },
              { step: '2', title: 'Connect', desc: 'Message landlords directly' },
              { step: '3', title: 'Schedule', desc: 'Book property tours easily' },
              { step: '4', title: 'Move In', desc: 'Secure your lease and move in' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Number */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mb-4 shadow-lg"
                >
                  {item.step}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>

                {/* Connector Line */}
                {idx < 3 && (
                  <div className="hidden md:block absolute -right-4 top-8 w-8 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from happy renters</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', text: 'Found my perfect apartment in just 2 days. The process was so smooth!', rating: 5 },
              { name: 'Mike Chen', text: 'RentGo made it incredibly easy to connect with landlords. Highly recommended!', rating: 5 },
              { name: 'Emily Davis', text: 'Great selection of properties and excellent customer support. 10/10!', rating: 5 }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl bg-white shadow-lg border border-gray-100"
              >
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="font-bold text-gray-900">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Stay Updated
            </motion.h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our newsletter for weekly updates on the best properties and deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                <FaPaperPlane />
                <span>Subscribe</span>
              </button>
            </form>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Find Your Next Home?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-8 opacity-90"
          >
            Join thousands of renters finding their perfect space today
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/search"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
              Create Account
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer Spacer */}
      <div className="h-8"></div>
    </div>
  );
};

export default Home;
