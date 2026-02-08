import { motion } from 'framer-motion';
import { FaCheck, FaLock, FaShieldAlt } from 'react-icons/fa';

const CheckoutSummary = ({
  propertyTitle = 'Property Name',
  pricePerNight = 0,
  nights = 1,
  checkInDate = null,
  checkOutDate = null,
  cleaningFee = 0,
  serviceFee = 0,
  taxes = 0,
  discount = 0,
  onBook = () => {},
  isLoading = false
}) => {
  const subtotal = pricePerNight * nights;
  const total = subtotal + cleaningFee + serviceFee + taxes - discount;

  const breakdownItems = [
    { label: 'Nightly Rate x Nights', amount: subtotal, show: nights > 0 },
    { label: 'Cleaning Fee', amount: cleaningFee, show: cleaningFee > 0 },
    { label: 'Service Fee', amount: serviceFee, show: serviceFee > 0 },
    { label: 'Taxes & Fees', amount: taxes, show: taxes > 0 },
    { label: 'Discount', amount: -discount, show: discount > 0, highlight: true },
  ].filter(item => item.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="sticky top-20 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Property Title and Dates */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{propertyTitle}</h3>
        {checkInDate && checkOutDate && (
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-900">Check-in:</span>{' '}
              {new Date(checkInDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p>
              <span className="font-medium text-gray-900">Check-out:</span>{' '}
              {new Date(checkOutDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            {nights > 0 && (
              <p>
                <span className="font-medium text-gray-900">Nights:</span> {nights}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-b border-gray-200 pb-6">
        <h4 className="font-semibold text-gray-900 text-sm">Price Breakdown</h4>
        {breakdownItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
            className="flex justify-between items-center"
          >
            <span className={`text-sm ${item.highlight ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
              {item.label}
            </span>
            <span className={`text-sm font-medium ${item.highlight ? 'text-green-600' : 'text-gray-900'}`}>
              {item.amount < 0 ? '-' : ''} ${Math.abs(item.amount).toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
      >
        <span className="font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </motion.div>

      {/* Book Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBook}
        disabled={isLoading || nights === 0}
        className={`
          w-full py-3 sm:py-4 rounded-lg font-bold text-white transition-all duration-300
          ${isLoading || nights === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-500 to-red-400 hover:from-pink-600 hover:to-red-500 cursor-pointer'
          }
        `}
      >
        {isLoading ? 'Booking...' : 'Book Now'}
      </motion.button>

      {/* Trust Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="space-y-3 text-xs text-gray-600"
      >
        <div className="flex items-start gap-2">
          <FaLock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Your payment is secure with encryption</span>
        </div>
        <div className="flex items-start gap-2">
          <FaShieldAlt className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <span>24/7 guest support for peace of mind</span>
        </div>
        <div className="flex items-start gap-2">
          <FaCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Free cancellation up to 7 days before</span>
        </div>
      </motion.div>

      {/* Cancellation Policy */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
        <p className="font-semibold text-gray-900 mb-2">Cancellation Policy</p>
        <p className="text-gray-600">Cancel for free up to 7 days before arrival. After that, you'll be charged the first night's rate.</p>
      </div>
    </motion.div>
  );
};

export default CheckoutSummary;
