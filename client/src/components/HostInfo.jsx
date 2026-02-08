import { motion } from 'framer-motion';
import { FaStar, FaPhone, FaMessageDots, FaCalendarDays, FaShieldAlt, FaLanguage } from 'react-icons/fa';

const HostInfo = ({ host = {} }) => {
  const {
    name = 'John Doe',
    avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    isSuperhost = true,
    reviewCount = 124,
    rating = 4.9,
    responseRate = '98%',
    responseTime = 'within an hour',
    yearsHosting = 5,
    languages = ['English', 'Spanish'],
    bio = 'Passionate traveler and host committed to providing exceptional experiences.',
    verified = true
  } = host;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8"
    >
      {/* Host Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={avatar}
          alt={name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-gray-200"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h3>
            {verified && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                <FaShieldAlt className="w-3 h-3" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{rating}</span>
              <span className="text-gray-600">({reviewCount} reviews)</span>
            </div>

            {isSuperhost && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-orange-200">
                ⭐ Superhost
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Host Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-b border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{yearsHosting}</p>
          <p className="text-xs sm:text-sm text-gray-600">Years Hosting</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{responseRate}</p>
          <p className="text-xs sm:text-sm text-gray-600">Response Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center col-span-2 sm:col-span-1"
        >
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{responseTime}</p>
          <p className="text-xs sm:text-sm text-gray-600">Response Time</p>
        </motion.div>
      </div>

      {/* Bio */}
      <div className="py-6 border-b border-gray-200">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{bio}</p>
      </div>

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="py-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FaLanguage className="text-gray-600 w-5 h-5" />
            <h4 className="font-semibold text-gray-900">Languages</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          <FaMessageDots className="w-4 h-4" />
          <span>Send Message</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
        >
          <FaPhone className="w-4 h-4" />
          <span>Contact Host</span>
        </motion.button>
      </div>

      {/* Trust Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <p className="text-xs sm:text-sm text-blue-900 text-center">
          <strong>Book with confidence.</strong> All communication goes through RentGo for your protection.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HostInfo;
