import React, { useState, useEffect } from 'react';
import webVitalsMonitor from '../utils/webVitals';

const WebVitalsDashboard = () => {
	const [vitals, setVitals] = useState({});
	const [showDashboard, setShowDashboard] = useState(false);

	useEffect(() => {
		const handleVital = (vital) => {
			setVitals((prev) => ({
				...prev,
				[vital.name]: vital,
			}));
		};

		webVitalsMonitor.onVital(handleVital);

		return () => {
			// Cleanup
		};
	}, []);

	const getVitalColor = (rating) => {
		switch (rating) {
			case 'good':
				return 'bg-green-100 border-green-500 text-green-700';
			case 'needs-improvement':
				return 'bg-yellow-100 border-yellow-500 text-yellow-700';
			case 'poor':
				return 'bg-red-100 border-red-500 text-red-700';
			default:
				return 'bg-gray-100 border-gray-500 text-gray-700';
		}
	};

	const getThresholds = (metricName) => {
		const thresholds = {
			LCP: { good: 2500, poor: 4000, unit: 'ms' },
			FID: { good: 100, poor: 300, unit: 'ms' },
			CLS: { good: 0.1, poor: 0.25, unit: '' },
			FCP: { good: 1800, poor: 3000, unit: 'ms' },
			TTFB: { good: 600, poor: 1800, unit: 'ms' },
		};
		return thresholds[metricName] || { unit: '' };
	};

	if (!showDashboard) {
		return (
			<button
				onClick={() => setShowDashboard(true)}
				className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
				title="Open Web Vitals Dashboard"
			>
				📊 Vitals
			</button>
		);
	}

	const report = webVitalsMonitor.getReport();

	return (
		<div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
				<h3 className="font-bold flex items-center gap-2">
					📊 Web Vitals Monitor
				</h3>
				<button
					onClick={() => setShowDashboard(false)}
					className="hover:bg-blue-500 p-1 rounded transition-colors"
				>
					✕
				</button>
			</div>

			{/* Summary */}
			<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-3 gap-2 text-center text-sm">
				<div>
					<div className="text-lg font-bold text-green-600">{report.summary.good}</div>
					<div className="text-xs text-gray-600">Good</div>
				</div>
				<div>
					<div className="text-lg font-bold text-yellow-600">{report.summary.needsImprovement}</div>
					<div className="text-xs text-gray-600">Needs Work</div>
				</div>
				<div>
					<div className="text-lg font-bold text-red-600">{report.summary.poor}</div>
					<div className="text-xs text-gray-600">Poor</div>
				</div>
			</div>

			{/* Vitals List */}
			<div className="overflow-y-auto max-h-80 p-4 space-y-3">
				{Object.entries(vitals).map(([name, vital]) => {
					const threshold = getThresholds(name);
					const formattedValue =
						vital.value % 1 === 0
							? vital.value
							: vital.value.toFixed(2);

					return (
						<div key={name} className={`rounded border-2 p-3 ${getVitalColor(vital.rating)}`}>
							<div className="flex justify-between items-start mb-2">
								<span className="font-bold text-sm">{name}</span>
								<span className="text-xs font-semibold uppercase">
									{vital.rating.replace('-', ' ')}
								</span>
							</div>
							<div className="text-2xl font-bold mb-1">
								{formattedValue} {threshold.unit}
							</div>
							<div className="text-xs opacity-75">
								Good: ≤ {threshold.good} | Poor: &gt; {threshold.poor}
							</div>
						</div>
					);
				})}

				{Object.keys(vitals).length === 0 && (
					<div className="text-center py-8 text-gray-500">
						<p className="text-sm">Waiting for metrics to load...</p>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
				<span>Last updated: {new Date().toLocaleTimeString()}</span>
				<button
					onClick={() => {
						const stats = webVitalsMonitor.getReport();
						console.log('=== Web Vitals Report ===');
						console.table(stats.vitals);
						console.log('Summary:', stats.summary);
					}}
					className="text-blue-600 hover:text-blue-700 font-semibold"
				>
					Export
				</button>
			</div>
		</div>
	);
};

export default WebVitalsDashboard;
