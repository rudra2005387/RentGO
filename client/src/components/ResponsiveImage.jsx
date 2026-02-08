import React, { useState, useRef, useEffect } from 'react';

const ResponsiveImage = ({
	srcWebP,
	srcFallback,
	alt,
	placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
	width,
	height,
	className = '',
	sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
	onLoad,
	onError,
	lazy = true,
}) => {
	const [imageSrc, setImageSrc] = useState(placeholder);
	const [isLoaded, setIsLoaded] = useState(false);
	const [supportsWebP, setSupportsWebP] = useState(true);
	const imgRef = useRef(null);

	// Check WebP support
	useEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const result =
			canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
		setSupportsWebP(result);
	}, []);

	useEffect(() => {
		const loadImage = () => {
			const src = supportsWebP && srcWebP ? srcWebP : srcFallback;
			setImageSrc(src);
		};

		if (lazy) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							loadImage();
							observer.unobserve(entry.target);
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
		} else {
			loadImage();
		}
	}, [supportsWebP, srcWebP, srcFallback, lazy]);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		if (supportsWebP && srcWebP && imageSrc !== srcFallback) {
			setImageSrc(srcFallback);
		} else {
			setImageSrc(placeholder);
			onError?.();
		}
	};

	return (
		<picture>
			{srcWebP && supportsWebP && (
				<source
					srcSet={srcWebP}
					type="image/webp"
					sizes={sizes}
				/>
			)}
			<img
				ref={imgRef}
				src={imageSrc}
				alt={alt}
				width={width}
				height={height}
				className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-75'} transition-opacity duration-300`}
				onLoad={handleLoad}
				onError={handleError}
				loading={lazy ? 'lazy' : 'eager'}
				sizes={sizes}
			/>
		</picture>
	);
};

export default ResponsiveImage;
