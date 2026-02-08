
export function getWebPImagePath(imagePath) {
	if (!imagePath) return null;

	const extension = imagePath.split('.').pop();
	if (!extension) return imagePath;

	return imagePath.replace(new RegExp(`\\.${extension}$`), '.webp');
}


export function generateSrcSet(basePath, sizes = []) {
	if (!basePath) return '';

	const defaultSizes = [
		{ width: 320, size: 320 },
		{ width: 640, size: 640 },
		{ width: 1024, size: 1024 },
		{ width: 1920, size: 1920 },
	];

	const imageSizes = sizes.length > 0 ? sizes : defaultSizes;

	return imageSizes
		.map((s) => {
			const path = basePath.replace('[size]', s.size);
			return `${path} ${s.width}w`;
		})
		.join(', ');
}

/**
 * Preload images for better performance
 */
export function preloadImage(src) {
	if (typeof window === 'undefined') return;

	const img = new Image();
	img.src = src;
}

/**
 * Preload multiple images
 */
export function preloadImages(sources) {
	sources.forEach((src) => preloadImage(src));
}

/**
 * Defer non-critical scripts
 */
export function deferScript(src, options = {}) {
	if (typeof window === 'undefined') return;

	const script = document.createElement('script');
	script.src = src;
	script.defer = true;
	script.async = options.async !== false;

	if (options.onLoad) {
		script.onload = options.onLoad;
	}

	document.body.appendChild(script);
}

/**
 * Check if feature is supported
 */
export const featureSupport = {
	webp: () => {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
	},

	intersectionObserver: () => {
		return 'IntersectionObserver' in window;
	},

	webWorker: () => {
		return typeof Worker !== 'undefined';
	},

	lazyLoading: () => {
		const img = document.createElement('img');
		return 'loading' in img;
	},

	nativeWebP: () => {
		const img = new Image();
		img.onload = img.onerror = () => {};
		img.src =
			'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoBAAEAAUAcJaACdLoBDgA=';
		return img.width === 1;
	},
};


export function getOptimizedImageSrc(jpgSrc, webpSrc) {
	return featureSupport.nativeWebP() && webpSrc ? webpSrc : jpgSrc;
}

export const performanceMetrics = {
	
	getNavigationTiming: () => {
		const timing = performance.getEntriesByType('navigation')[0];
		if (!timing) return null;

		return {
			dns: timing.domainLookupEnd - timing.domainLookupStart,
			tcp: timing.connectEnd - timing.connectStart,
			request: timing.responseStart - timing.requestStart,
			response: timing.responseEnd - timing.responseStart,
			domParsing: timing.domInteractive - timing.domLoading,
			contentLoaded:
				timing.domContentLoadedEventEnd -
				timing.domContentLoadedEventStart,
			load:
				timing.loadEventEnd - timing.loadEventStart,
			total: timing.loadEventEnd - timing.fetchStart,
		};
	},

	// Get Resource Timing
	getResourceTiming: (name) => {
		const resources = performance.getEntriesByType('resource');
		if (!name) return resources;

		return resources.find((r) => r.name.includes(name));
	},

	
	getAllMetrics: () => {
		return {
			navigation: performanceMetrics.getNavigationTiming(),
			resources: performanceMetrics.getResourceTiming(),
			memory:
				performance.memory !== undefined
					? {
							usedJSHeapSize:
								performance.memory.usedJSHeapSize,
							totalJSHeapSize:
								performance.memory.totalJSHeapSize,
							jsHeapSizeLimit:
								performance.memory.jsHeapSizeLimit,
						}
					: null,
		};
	},
};


export function logPerformanceMetrics() {
	console.group('🚀 Performance Metrics');

	const navigation = performanceMetrics.getNavigationTiming();
	if (navigation) {
		console.group('Navigation Timing');
		console.table(navigation);
		console.groupEnd();
	}

	const memory = performanceMetrics.getAllMetrics().memory;
	if (memory) {
		console.group('Memory Usage');
		console.log(
			`Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`
		);
		console.log(
			`Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`
		);
		console.log(
			`Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
		);
		console.groupEnd();
	}

	console.groupEnd();
}


export function createScrollListener(callback, delay = 100) {
	let timeout;

	window.addEventListener('scroll', () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			callback(window.scrollY);
		}, delay);
	});
}


export function createResizeListener(callback, delay = 100) {
	let timeout;

	window.addEventListener('resize', () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			callback(window.innerWidth, window.innerHeight);
		}, delay);
	});
}


export function analyzeUnusedJS() {
	console.warn(
		'Use Chrome DevTools Coverage tab to analyze unused JavaScript'
	);
}

export function analyzeCSSDelivery() {
	const styles = document.querySelectorAll('link[rel="stylesheet"]');
	console.group('CSS Delivery Analysis');
	console.log(`Total stylesheets: ${styles.length}`);

	styles.forEach((style) => {
		const media = style.getAttribute('media');
		console.log({
			href: style.href,
			media: media || 'default (applies to all)',
			render_blocking:
				!media || media === 'all' ? '⚠️ Yes' : '✅ No',
		});
	});

	console.groupEnd();
}

export default {
	getWebPImagePath,
	generateSrcSet,
	preloadImage,
	preloadImages,
	deferScript,
	featureSupport,
	getOptimizedImageSrc,
	performanceMetrics,
	logPerformanceMetrics,
	createScrollListener,
	createResizeListener,
	analyzeUnusedJS,
	analyzeCSSDelivery,
};
