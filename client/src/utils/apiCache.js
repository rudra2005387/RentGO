// API Response Caching Utility

class APICache {
	constructor() {
		this.cache = new Map();
		this.timers = new Map();
	}

	/**
	 * Generate cache key from URL and options
	 */
	generateKey(url, options = {}) {
		return `${url}:${JSON.stringify(options)}`;
	}

	/**
	 * Set cache with TTL (time to live) in milliseconds
	 */
	set(url, data, ttl = 5 * 60 * 1000, options = {}) {
		const key = this.generateKey(url, options);

		// Clear existing timer
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key));
		}

		// Store data with timestamp
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});

		// Set auto-clear timer
		const timer = setTimeout(() => {
			this.delete(url, options);
		}, ttl);

		this.timers.set(key, timer);
		console.log(`[Cache] Stored: ${key}`);
	}

	/**
	 * Get cached data if not expired
	 */
	get(url, options = {}) {
		const key = this.generateKey(url, options);
		const cached = this.cache.get(key);

		if (!cached) {
			console.log(`[Cache] Miss: ${key}`);
			return null;
		}

		const age = Date.now() - cached.timestamp;
		if (age > cached.ttl) {
			this.delete(url, options);
			console.log(`[Cache] Expired: ${key}`);
			return null;
		}

		console.log(`[Cache] Hit: ${key}`);
		return cached.data;
	}

	/**
	 * Check if data exists and is fresh
	 */
	has(url, options = {}) {
		return this.get(url, options) !== null;
	}

	/**
	 * Delete specific cache entry
	 */
	delete(url, options = {}) {
		const key = this.generateKey(url, options);
		this.cache.delete(key);
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key));
			this.timers.delete(key);
		}
		console.log(`[Cache] Deleted: ${key}`);
	}

	/**
	 * Clear all cache
	 */
	clear() {
		this.timers.forEach((timer) => clearTimeout(timer));
		this.cache.clear();
		this.timers.clear();
		console.log('[Cache] Cleared all');
	}

	/**
	 * Get cache stats
	 */
	stats() {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
		};
	}
}

// Create singleton instance
const apiCache = new APICache();

/**
 * Wrapper for fetch with automatic caching
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} cacheTTL - TTL in milliseconds (default 5 minutes)
 */
export async function cachedFetch(url, options = {}, cacheTTL = 5 * 60 * 1000) {
	// Only cache GET requests
	if (options.method && options.method !== 'GET') {
		return fetch(url, options).then((res) => res.json());
	}

	// Check cache first
	const cached = apiCache.get(url, options);
	if (cached) {
		return Promise.resolve(cached);
	}

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Cache successful responses
		apiCache.set(url, data, cacheTTL, options);

		return data;
	} catch (error) {
		console.error('[Cache] Fetch error:', error);
		throw error;
	}
}

/**
 * React Hook for cached API calls
 */
export function useCachedAPI(url, options = {}, cacheTTL = 5 * 60 * 1000) {
	const [data, setData] = React.useState(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			try {
				setLoading(true);
				const result = await cachedFetch(url, options, cacheTTL);
				if (isMounted) {
					setData(result);
					setError(null);
				}
			} catch (err) {
				if (isMounted) {
					setError(err);
					setData(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [url, cacheTTL]);

	const refetch = React.useCallback(
		async () => {
			apiCache.delete(url, options);
			return cachedFetch(url, options, cacheTTL);
		},
		[url, options, cacheTTL]
	);

	return { data, loading, error, refetch, cache: apiCache };
}

/**
 * Invalidate cache for specific URL
 */
export function invalidateCache(url, options = {}) {
	apiCache.delete(url, options);
}

/**
 * Invalidate all cache
 */
export function invalidateAllCache() {
	apiCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
	return apiCache.stats();
}

export default apiCache;
