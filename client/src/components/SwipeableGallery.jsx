import React, { useState, useRef, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SwipeableGallery = ({ images, title = 'Gallery' }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);
	const containerRef = useRef(null);
	const touchStartX = useRef(0);

	const handleMouseDown = useCallback((e) => {
		setIsDragging(true);
		setStartX(e.clientX);
		touchStartX.current = e.clientX;
	}, []);

	const handleMouseMove = useCallback(
		(e) => {
			if (!isDragging) return;
			const diff = e.clientX - startX;
			setDragOffset(diff);
		},
		[isDragging, startX]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		const threshold = 50;

		if (dragOffset > threshold && currentIndex > 0) {
			// Swiped right
			setCurrentIndex(currentIndex - 1);
		} else if (dragOffset < -threshold && currentIndex < images.length - 1) {
			// Swiped left
			setCurrentIndex(currentIndex + 1);
		}
		setDragOffset(0);
	}, [isDragging, dragOffset, currentIndex, images.length]);

	const handleTouchStart = useCallback((e) => {
		touchStartX.current = e.touches[0].clientX;
	}, []);

	const handleTouchEnd = useCallback(
		(e) => {
			const touchEndX = e.changedTouches[0].clientX;
			const diff = touchStartX.current - touchEndX;
			const threshold = 50;

			if (diff > threshold && currentIndex < images.length - 1) {
				// Swiped left
				setCurrentIndex(currentIndex + 1);
			} else if (diff < -threshold && currentIndex > 0) {
				// Swiped right
				setCurrentIndex(currentIndex - 1);
			}
		},
		[currentIndex, images.length]
	);

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
	};

	if (!images || images.length === 0) {
		return (
			<div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
				<p className="text-gray-500">No images available</p>
			</div>
		);
	}

	return (
		<div
			className="relative w-full bg-black rounded-lg overflow-hidden group"
			ref={containerRef}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			aria-label={title}
			role="region"
		>
			{/* Image Container */}
			<div className="relative w-full pb-full bg-black cursor-grab active:cursor-grabbing">
				<div className="relative aspect-square overflow-hidden">
					<img
						src={images[currentIndex]}
						alt={`${title} slide ${currentIndex + 1} of ${images.length}`}
						className={`w-full h-full object-cover transition-opacity duration-300 ${
							isDragging ? 'opacity-90' : 'opacity-100'
						}`}
						draggable={false}
					/>

					{/* Left Arrow */}
					<button
						onClick={goToPrevious}
						className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
						aria-label={`Previous image (${currentIndex} of ${images.length})`}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								goToPrevious();
							}
						}}
					>
						<FaChevronLeft className="text-lg" />
					</button>

					{/* Right Arrow */}
					<button
						onClick={goToNext}
						className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
						aria-label={`Next image (${currentIndex + 2} of ${images.length})`}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								goToNext();
							}
						}}
					>
						<FaChevronRight className="text-lg" />
					</button>
				</div>
			</div>

			{/* Indicators */}
			<div className="flex gap-1 justify-center items-center py-2 bg-black/30">
				{images.map((_, idx) => (
					<button
						key={idx}
						onClick={() => setCurrentIndex(idx)}
						className={`h-2 rounded-full transition-all ${
							idx === currentIndex
								? 'bg-white w-6'
								: 'bg-white/50 hover:bg-white/75 w-2'
						}`}
						aria-label={`Go to image ${idx + 1}`}
						aria-current={idx === currentIndex ? 'true' : 'false'}
					/>
				))}
			</div>

			{/* Counter */}
			<div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
				{currentIndex + 1} / {images.length}
			</div>
		</div>
	);
};

export default SwipeableGallery;
