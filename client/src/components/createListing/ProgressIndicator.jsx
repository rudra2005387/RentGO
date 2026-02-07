import React from 'react';

export default function ProgressIndicator({ currentStep, totalSteps }) {
	const steps = [
		'Property Type',
		'Photos',
		'Details',
		'Amenities',
		'Pricing',
		'Availability',
		'Review'
	];

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				{steps.map((step, idx) => (
					<div key={idx} className="flex flex-col items-center flex-1">
						<div
							className={`
								w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
								${idx + 1 < currentStep ? 'bg-green-500 text-white' : 
								  idx + 1 === currentStep ? 'bg-blue-600 text-white' : 
								  'bg-gray-200 text-gray-600'}
								transition-colors
							`}
						>
							{idx + 1 < currentStep ? '✓' : idx + 1}
						</div>
						<label className="text-xs text-center mt-2 font-medium text-gray-700">
							{step}
						</label>
					</div>
				))}
			</div>
			
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className="bg-blue-600 h-2 rounded-full transition-all"
					style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
				></div>
			</div>
			
			<div className="text-center mt-4 text-sm text-gray-600">
				Step {currentStep} of {totalSteps}
			</div>
		</div>
	);
}
