import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({
	src,
	alt,
	placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
	width,
	height,
	className = '',
	onLoad,
	onError,
}) => {
	const [imageSrc, setImageSrc] = useState(placeholder);
	const [isLoaded, setIsLoaded] = useState(false);
	const imgRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target;
						setImageSrc(img.dataset.src);
						observer.unobserve(img);
					}
				});
			},
			{
				rootMargin: '50px',
			}
		);

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setImageSrc(placeholder);
		onError?.();
	};

	return (
		<img
			ref={imgRef}
			data-src={src}
			src={imageSrc}
			alt={alt}
			width={width}
			height={height}
			className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-75'} transition-opacity duration-300`}
			onLoad={handleLoad}
			onError={handleError}
			loading="lazy"
		/>
	);
};

export default LazyImage;
