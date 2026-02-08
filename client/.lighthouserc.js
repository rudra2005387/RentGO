

export const lighthouseConfig = {
	ci: {
		collect: {
			url: [
				'http://localhost:5173',
				'http://localhost:5173/search',
				'http://localhost:5173/advanced-search',
				'http://localhost:5173/profile',
				'http://localhost:5173/dashboard',
			],
			numberOfRuns: 3,
			staticDistDir: './dist',
		},
		upload: {
			target: 'temporary-public-storage',
		},
		assert: {
			preset: 'lighthouse:recommended',
			assertions: {
				'categories:performance': ['error', { minScore: 0.8 }],
				'categories:accessibility': ['error', { minScore: 0.9 }],
				'categories:best-practices': ['error', { minScore: 0.8 }],
				'categories:seo': ['error', { minScore: 0.8 }],
				'first-contentful-paint': ['error', { maxNumericValue: 3000 }],
				'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
				'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
				'total-byte-weight': ['error', { maxNumericValue: 5242880 }], // 5MB
			},
		},
	},
};

export default lighthouseConfig;
