import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaWindowClose, FaShareAlt, FaHeart } from 'react-icons/fa';

const PropertyGallery = ({ images = [], propertyTitle = 'Property', onShare = () => {} }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const goToPrevious = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  if (!images.length) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="w-full">
        {/* Single Image View */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-96 sm:h-[500px] rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={images[activeIndex]}
            alt={`${propertyTitle} - ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
              >
                <FaChevronRight className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg"
              aria-label="Share"
            >
              <FaShareAlt className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorited(!isFavorited);
              }}
              className={`rounded-full p-3 shadow-lg transition-all ${
                isFavorited
                  ? 'bg-red-400 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-900'
              }`}
              aria-label="Add to favorites"
            >
              <FaHeart className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveIndex(index)}
                className={`
                  relative flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all
                  ${activeIndex === index ? 'border-blue-600 ring-2 ring-blue-400' : 'border-transparent hover:border-gray-300'}
                `}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-3"
              aria-label="Close fullscreen"
            >
              <FaWindowClose className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={images[activeIndex]}
                alt={`${propertyTitle} fullscreen`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Fullscreen Navigation */}
              {images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-4"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-4"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="w-6 h-6" />
                  </motion.button>
                </>
              )}

              {/* Fullscreen Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {activeIndex + 1} / {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyGallery;
