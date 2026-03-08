import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

/**
 * Interactive or read-only star rating component.
 * @param {{ rating: number, onRate?: (n:number)=>void, size?: number, readOnly?: boolean }} props
 */
export default function StarRating({ rating = 0, onRate, size = 20, readOnly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="inline-flex gap-0.5" role="group" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} bg-transparent border-none p-0`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <FaStar
            size={size}
            className={
              (hovered || rating) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
}
