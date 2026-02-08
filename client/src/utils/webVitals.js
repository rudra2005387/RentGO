// Core Web Vitals Monitoring

/**
 * Monitor Core Web Vitals:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 */

class WebVitalsMonitor {
	constructor() {
		this.vitals = {};
		this.listeners = [];
	}

	/**
	 * Register callback for vital updates
	 */
	onVital(callback) {
		this.listeners.push(callback);
	}

	/**
	 * Notify all listeners of vital update
	 */
	notifyListeners(vital) {
		this.listeners.forEach((callback) => callback(vital));
		console.log('[Web Vitals]', vital);
	}

	/**
	 * Monitor Largest Contentful Paint (LCP)
	 */
	monitorLCP() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1];
				const lcp = {
					name: 'LCP',
					value: lastEntry.renderTime || lastEntry.loadTime,
					rating: this.rateMetric('LCP', lastEntry.renderTime || lastEntry.loadTime),
					entry: lastEntry,
				};
				this.vitals.LCP = lcp;
				this.notifyListeners(lcp);
			});

			observer.observe({ entryTypes: ['largest-contentful-paint'] });
		} catch (error) {
			console.error('[Web Vitals] LCP monitoring error:', error);
		}
	}

	/**
	 * Monitor First Input Delay (FID)
	 */
	monitorFID() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					const fid = {
						name: 'FID',
						value: entry.processingDuration,
						rating: this.rateMetric('FID', entry.processingDuration),
						entry: entry,
					};
					this.vitals.FID = fid;
					this.notifyListeners(fid);
				});
			});

			observer.observe({ entryTypes: ['first-input'] });
		} catch (error) {
			console.error('[Web Vitals] FID monitoring error:', error);
		}
	}

	/**
	 * Monitor Cumulative Layout Shift (CLS)
	 */
	monitorCLS() {
		if (!('PerformanceObserver' in window)) return;

		let cls = 0;

		try {
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (!entry.hadRecentInput) {
						cls += entry.value;
						const clsVital = {
							name: 'CLS',
							value: cls,
							rating: this.rateMetric('CLS', cls),
							entry: entry,
						};
						this.vitals.CLS = clsVital;
						this.notifyListeners(clsVital);
					}
				}
			});

			observer.observe({ entryTypes: ['layout-shift'] });
		} catch (error) {
			console.error('[Web Vitals] CLS monitoring error:', error);
		}
	}

	/**
	 * Monitor First Contentful Paint (FCP)
	 */
	monitorFCP() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					if (entry.name === 'first-contentful-paint') {
						const fcp = {
							name: 'FCP',
							value: entry.startTime,
							rating: this.rateMetric('FCP', entry.startTime),
							entry: entry,
						};
						this.vitals.FCP = fcp;
						this.notifyListeners(fcp);
					}
				});
			});

			observer.observe({ entryTypes: ['paint'] });
		} catch (error) {
			console.error('[Web Vitals] FCP monitoring error:', error);
		}
	}

	/**
	 * Monitor Time to First Byte (TTFB)
	 */
	monitorTTFB() {
		try {
			const navigationTiming = performance.getEntriesByType(
				'navigation'
			)[0];

			if (navigationTiming) {
				const ttfb = {
					name: 'TTFB',
					value: navigationTiming.responseStart,
					rating: this.rateMetric('TTFB', navigationTiming.responseStart),
					entry: navigationTiming,
				};
				this.vitals.TTFB = ttfb;
				this.notifyListeners(ttfb);
			}
		} catch (error) {
			console.error('[Web Vitals] TTFB monitoring error:', error);
		}
	}

	/**
	 * Rate metric as good/needs improvement/poor
	 */
	rateMetric(metricName, value) {
		const thresholds = {
			LCP: { good: 2500, poor: 4000 },
			FID: { good: 100, poor: 300 },
			CLS: { good: 0.1, poor: 0.25 },
			FCP: { good: 1800, poor: 3000 },
			TTFB: { good: 600, poor: 1800 },
		};

		const threshold = thresholds[metricName];
		if (!threshold) return 'unknown';

		if (value <= threshold.good) return 'good';
		if (value <= threshold.poor) return 'needs-improvement';
		return 'poor';
	}

	/**
	 * Start monitoring all vitals
	 */
	startMonitoring() {
		console.log('[Web Vitals] Starting monitoring...');
		this.monitorTTFB();
		this.monitorFCP();
		this.monitorLCP();
		this.monitorFID();
		this.monitorCLS();
	}

	/**
	 * Get all collected vitals
	 */
	getVitals() {
		return this.vitals;
	}

	/**
	 * Get report object
	 */
	getReport() {
		return {
			timestamp: new Date().toISOString(),
			vitals: this.vitals,
			summary: {
				good: Object.values(this.vitals).filter(
					(v) => v.rating === 'good'
				).length,
				needsImprovement: Object.values(this.vitals).filter(
					(v) => v.rating === 'needs-improvement'
				).length,
				poor: Object.values(this.vitals).filter(
					(v) => v.rating === 'poor'
				).length,
			},
		};
	}

	/**
	 * Send vitals to analytics
	 */
	sendToAnalytics(endpoint) {
		const report = this.getReport();
		navigator.sendBeacon(endpoint, JSON.stringify(report));
		console.log('[Web Vitals] Report sent to', endpoint);
	}
}

// Create singleton instance
const webVitalsMonitor = new WebVitalsMonitor();

/**
 * React Hook for Web Vitals monitoring
 */
export function useWebVitals() {
	const [vitals, setVitals] = React.useState({});

	React.useEffect(() => {
		const handleVital = (vital) => {
			setVitals((prev) => ({
				...prev,
				[vital.name]: vital,
			}));
		};

		webVitalsMonitor.onVital(handleVital);
		webVitalsMonitor.startMonitoring();

		return () => {
			// Cleanup if needed
		};
	}, []);

	return vitals;
}

// Initialize monitoring on import
if (typeof window !== 'undefined') {
	webVitalsMonitor.startMonitoring();
}

export default webVitalsMonitor;
