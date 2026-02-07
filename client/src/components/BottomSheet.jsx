import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

const BottomSheet = ({
	isOpen,
	onClose,
	title,
	children,
	height = 'h-3/4',
	isDraggable = true,
}) => {
	const sheetRef = useRef(null);
	const dragHandleRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [currentY, setCurrentY] = useState(0);

	// Handle outside click
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		const handleOutsideClick = (e) => {
			if (sheetRef.current && e.target === sheetRef.current) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		document.addEventListener('mousedown', handleOutsideClick);

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isOpen, onClose]);

	const handleMouseDown = useCallback((e) => {
		if (!isDraggable) return;
		setIsDragging(true);
		setStartY(e.clientY);
	}, [isDraggable]);

	const handleMouseMove = useCallback((e) => {
		if (!isDragging || !isDraggable) return;
		const diff = e.clientY - startY;
		if (diff > 0) {
			setCurrentY(Math.min(diff, 200));
		}
	}, [isDragging, startY, isDraggable]);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		if (currentY > 100) {
			onClose();
		}
		setCurrentY(0);
	}, [currentY, onClose]);

	const handleTouchStart = useCallback(
		(e) => {
			if (!isDraggable) return;
			setIsDragging(true);
			setStartY(e.touches[0].clientY);
		},
		[isDraggable]
	);

	const handleTouchMove = useCallback(
		(e) => {
			if (!isDragging || !isDraggable) return;
			const diff = e.touches[0].clientY - startY;
			if (diff > 0) {
				setCurrentY(Math.min(diff, 200));
			}
		},
		[isDragging, startY, isDraggable]
	);

	const handleTouchEnd = useCallback(() => {
		setIsDragging(false);
		if (currentY > 100) {
			onClose();
		}
		setCurrentY(0);
	}, [currentY, onClose]);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				ref={sheetRef}
				className="fixed inset-0 bg-black/50 z-40 md:hidden"
				onClick={onClose}
				role="presentation"
				aria-hidden="true"
			/>

			{/* Bottom Sheet */}
			<div
				className={`fixed bottom-0 left-0 right-0 ${height} bg-white rounded-t-2xl shadow-2xl z-50 md:hidden transition-transform duration-300 ${
					isDragging ? 'cursor-grabbing' : 'cursor-grab'
				}`}
				style={{
					transform: isDragging ? `translateY(${currentY}px)` : 'translateY(0)',
				}}
				role="dialog"
				aria-modal="true"
				aria-labelledby="bottom-sheet-title"
			>
				{/* Drag Handle */}
				{isDraggable && (
					<div
						ref={dragHandleRef}
						className="flex justify-center items-center py-2 cursor-grab active:cursor-grabbing select-none"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						role="presentation"
						aria-label="Drag to close"
					>
						<div className="w-12 h-1 bg-gray-300 rounded-full" />
					</div>
				)}

				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
					<h2
						id="bottom-sheet-title"
						className="text-lg font-semibold text-gray-900"
					>
						{title}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Close bottom sheet"
					>
						<FaTimes className="text-lg" />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto flex-1 px-4 py-4 pb-20">
					{children}
				</div>
			</div>
		</>
	);
};

export default BottomSheet;
