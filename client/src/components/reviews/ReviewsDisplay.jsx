// Enhanced Reviews System Component
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUser, FaReply, FaThumbsUp } from 'react-icons/fa';
import { containerVariants, itemVariants } from '../../utils/animations';

export const ReviewsDisplay = ({ reviews = [] }) => {
  const [expandedReview, setExpandedReview] = useState(null);
  const [filter, setFilter] = useState('all');

  const stats = {
    avgRating: reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
    totalReviews: reviews.length,
    distribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter));

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Overview */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">{stats.avgRating}</span>
                <span className="text-2xl text-rose-500">★</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Based on {stats.totalReviews} reviews</p>
            </div>
          </motion.div>

          {/* Rating Distribution */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{rating}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.distribution[rating] / stats.totalReviews) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{stats.distribution[rating]}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', '5', '4', '3', '2', '1'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Reviews' : `${f} ⭐`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">No reviews with this rating yet.</p>
            </motion.div>
          ) : (
            filteredReviews.map((review, idx) => (
              <motion.div
                key={review._id || idx}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Reviewer Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.reviewer?.profileImage ? (
                      <img
                        src={review.reviewer.profileImage}
                        alt={review.reviewer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {review.reviewer?.name?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{review.reviewer?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${i < review.rating ? 'text-rose-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 mb-3">{review.comment}</p>

                {/* Helpful & Reply */}
                <div className="flex gap-4 text-sm">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors">
                    <FaThumbsUp className="text-xs" />
                    Helpful ({review.helpful || 0})
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors">
                    <FaReply className="text-xs" />
                    Reply
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReviewsDisplay;
