import React, { useEffect, useCallback, useRef } from 'react';
import { cachedFetch, useCachedAPI } from '../utils/apiCache';
import { performanceMetrics } from '../utils/performance';

/**
 * Hook to monitor page performance metrics
 */
export function usePerformanceMonitor() {
	useEffect(() => {
		// Wait for page load
		if (document.readyState === 'complete') {
			const metrics = performanceMetrics.getAllMetrics();
			console.log('[Performance Monitor]', metrics);
		} else {
			window.addEventListener('load', () => {
				const metrics = performanceMetrics.getAllMetrics();
				console.log('[Performance Monitor]', metrics);
			});
		}
	}, []);
}

/**
 * Hook for lazy loading images
 */
export function useLazyImageLoading() {
	const containerRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const images = containerRef.current.querySelectorAll('img[data-src]');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target;
						if (img.dataset.src) {
							img.src = img.dataset.src;
							img.removeAttribute('data-src');
						}
						observer.unobserve(img);
					}
				});
			},
			{ rootMargin: '50px' }
		);

		images.forEach((img) => observer.observe(img));

		return () => observer.disconnect();
	}, []);

	return containerRef;
}

/**
 * Hook to prefetch pages/resources
 */
export function usePrefetch(urls = []) {
	useEffect(() => {
		urls.forEach((url) => {
			const link = document.createElement('link');
			link.rel = 'prefetch';
			link.href = url;
			document.head.appendChild(link);
		});
	}, [urls]);
}

/**
 * Hook for scroll performance optimization
 */
export function useScrollPerformance(callback, threshold = 100) {
	const timeoutRef = useRef(null);

	useEffect(() => {
		const handleScroll = () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callback(window.scrollY);
			}, threshold);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [callback, threshold]);
}

/**
 * Hook for managing API request caching
 */
export function useAPICache(url, cacheTTL = 5 * 60 * 1000) {
	return useCachedAPI(url, {}, cacheTTL);
}

/**
 * Hook for optimizing re-renders
 */
export function useRenderCount(componentName) {
	const renderCountRef = useRef(0);

	useEffect(() => {
		renderCountRef.current++;
		console.log(
			`[Render Count] ${componentName}: ${renderCountRef.current} renders`
		);
	});

	return renderCountRef.current;
}

/**
 * Hook for performance intersection observer
 */
export function useIntersectionObserver(ref, callback, options = {}) {
	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					callback(entry);
				});
			},
			{
				threshold: 0.1,
				rootMargin: '50px',
				...options,
			}
		);

		observer.observe(ref.current);

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
			observer.disconnect();
		};
	}, [callback, options]);
}

/**
 * Hook to defer non-essential work
 */
export function useDeferredValue(value, timeoutMs = 200) {
	const [deferredValue, setDeferredValue] = React.useState(value);
	const timeoutRef = useRef(null);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setDeferredValue(value);
		}, timeoutMs);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [value, timeoutMs]);

	return deferredValue;
}

export default {
	usePerformanceMonitor,
	useLazyImageLoading,
	usePrefetch,
	useScrollPerformance,
	useAPICache,
	useRenderCount,
	useIntersectionObserver,
	useDeferredValue,
};
