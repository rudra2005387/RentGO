import { useState, useCallback } from 'react';
import { FaStar, FaThumbsUp } from 'react-icons/fa';
import StarRating from './StarRating';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Avatar({ name, image }) {
  if (image) return <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />;
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

function ReviewCard({ review, token }) {
  const author = review.author || review.user || {};
  const name = [author.firstName, author.lastName].filter(Boolean).join(' ') || 'Guest';
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const hostResponse = review.hostResponse;
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [markedHelpful, setMarkedHelpful] = useState(false);

  const markHelpful = useCallback(async () => {
    if (markedHelpful || !token) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/${review._id}/helpful`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) {
        setHelpfulCount((c) => c + 1);
        setMarkedHelpful(true);
      }
    } catch {
      // silent
    }
  }, [review._id, token, markedHelpful]);

  return (
    <div className="border-b border-gray-100 py-5 last:border-none">
      <div className="flex items-start gap-3">
        <Avatar name={name} image={author.profileImage} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#222222]">{name}</p>
              <p className="text-xs text-[#717171]">{date}</p>
            </div>
            <StarRating rating={review.overallRating || review.rating || 0} size={14} readOnly />
          </div>

          {/* Category ratings if available */}
          {review.ratings && Object.keys(review.ratings).length > 0 && (
            <div className="flex gap-3 mt-2 flex-wrap">
              {Object.entries(review.ratings).map(([key, val]) => (
                val > 0 && (
                  <span key={key} className="text-xs text-[#717171]">
                    {key.charAt(0).toUpperCase() + key.slice(1)}: <span className="font-semibold text-[#222222]">{val}</span>
                  </span>
                )
              ))}
            </div>
          )}

          {review.comment && (
            <p className="text-sm text-[#484848] mt-2 leading-relaxed">{review.comment}</p>
          )}

          {/* Host response */}
          {hostResponse && (
            <div className="mt-3 pl-4 border-l-2 border-[#FF385C] bg-rose-50/50 rounded-r-lg py-2 pr-3">
              <p className="text-xs font-semibold text-[#222222] mb-1">Host Response</p>
              <p className="text-sm text-[#484848]">{hostResponse.comment || hostResponse}</p>
            </div>
          )}

          {/* Helpful button */}
          <button
            onClick={markHelpful}
            disabled={markedHelpful || !token}
            className={`flex items-center gap-1.5 mt-3 text-xs transition-colors ${
              markedHelpful ? 'text-[#FF385C] font-semibold' : 'text-[#717171] hover:text-[#222222]'
            } disabled:cursor-not-allowed`}
          >
            <FaThumbsUp size={11} />
            Helpful{helpfulCount > 0 && ` (${helpfulCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Review list with optional rating breakdown.
 * @param {{ reviews: Array, averageRating: number, token?: string }} props
 */
export default function ReviewList({ reviews = [], averageRating, token }) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 6);

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.overallRating || r.rating || 0) === star).length;
    return { star, count, pct: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div>
      {/* Summary */}
      <div className="flex items-start gap-8 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-[#222222]">{(averageRating || 0).toFixed(1)}</p>
          <StarRating rating={Math.round(averageRating || 0)} size={16} readOnly />
          <p className="text-xs text-[#717171] mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-[#717171] w-3">{star}</span>
              <FaStar className="text-yellow-400" size={10} />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#222222] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-[#717171] w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      {displayedReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm text-[#717171]">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {displayedReviews.map((r) => (
              <ReviewCard key={r._id} review={r} token={token} />
            ))}
          </div>
          {reviews.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 text-sm font-semibold text-[#222222] border border-[#222222] px-6 py-2.5 rounded-lg hover:bg-[#F7F7F7] transition-colors"
            >
              {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
