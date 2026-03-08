import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import StarRating from './StarRating';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value' },
];

/**
 * Review submission modal.
 * @param {{ bookingId: string, token: string, onClose: ()=>void, onSubmitted: (review)=>void }} props
 */
export default function ReviewForm({ bookingId, token, onClose, onSubmitted }) {
  const [overallRating, setOverallRating] = useState(0);
  const [ratings, setRatings] = useState({ cleanliness: 0, communication: 0, location: 0, value: 0 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateRating = (key, val) => setRatings((prev) => ({ ...prev, [key]: val }));

  const canSubmit = overallRating > 0 && comment.trim().length >= 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          overallRating,
          comment: comment.trim(),
          ratings,
        }),
      });
      const d = await res.json();
      if (d.success) {
        onSubmitted?.(d.data?.review || d.data);
        onClose();
      } else {
        setError(d.message || 'Failed to submit review');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-lg font-bold text-[#222222]">Write a Review</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-semibold text-[#222222] mb-2">Overall Rating *</label>
              <StarRating rating={overallRating} onRate={setOverallRating} size={28} />
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[#717171] mb-1">{label}</label>
                  <StarRating rating={ratings[key]} onRate={(val) => updateRating(key, val)} size={18} />
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-[#222222] mb-2">
                Your Review * <span className="font-normal text-[#717171]">(min 50 characters)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience — what was great, what could be improved?"
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#222222] transition-colors resize-none"
              />
              <p className={`text-xs mt-1 ${comment.trim().length >= 50 ? 'text-green-600' : 'text-[#717171]'}`}>
                {comment.trim().length}/50 characters
              </p>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full bg-[#FF385C] text-white font-semibold py-3 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
