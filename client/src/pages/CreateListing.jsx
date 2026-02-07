import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
	ProgressIndicator,
	Step1PropertyType,
	Step2Photos,
	Step3Details,
	Step4Amenities,
	Step5Pricing,
	Step6Availability,
	Step7Review
} from '../components/createListing';

const STORAGE_KEY = 'rg_listing_draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export default function CreateListing() {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		propertyType: '',
		title: '',
		location: '',
		description: '',
		photos: [],
		bedrooms: 1,
		bathrooms: 1,
		guests: 2,
		squareFeet: '',
		buildingType: '',
		amenities: [],
		additionalAmenities: '',
		pricePerNight: '',
		cleaningFee: '',
		serviceFeePercent: '',
		securityDeposit: '',
		weeklyDiscount: '',
		monthlyDiscount: '',
		blockedDates: [],
		minStayNights: 1,
		checkInTime: '14:00',
		checkOutTime: '11:00',
		rules: ''
	});

	const [lastSaved, setLastSaved] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState('not-saved');

	// Auto-save functionality
	useEffect(() => {
		const interval = setInterval(() => {
			autoSaveDraft();
		}, AUTO_SAVE_INTERVAL);

		return () => clearInterval(interval);
	}, [formData]);

	const autoSaveDraft = useCallback(() => {
		try {
			setIsSaving(true);
			const dataToSave = {
				...formData,
				lastSavedAt: new Date().toISOString()
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
			setLastSaved(new Date());
			setSaveStatus('saved');
			setTimeout(() => setSaveStatus('not-saved'), 3000);
		} catch (error) {
			console.error('Auto-save failed:', error);
			setSaveStatus('error');
		} finally {
			setIsSaving(false);
		}
	}, [formData]);

	// Load draft on mount
	useEffect(() => {
		const savedDraft = localStorage.getItem(STORAGE_KEY);
		if (savedDraft) {
			try {
				const data = JSON.parse(savedDraft);
				setFormData(data);
				setLastSaved(new Date(data.lastSavedAt));
			} catch (error) {
				console.error('Failed to load draft:', error);
			}
		}
	}, []);

	const handleInputChange = (newData) => {
		setFormData(newData);
		setSaveStatus('not-saved');
	};

	const goToStep = (step) => {
		if (step >= 1 && step <= 7) {
			setCurrentStep(step);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleSubmit = (finalData) => {
		// Clear draft on successful submission
		localStorage.removeItem(STORAGE_KEY);
		// Here you would send data to backend
		console.log('Listing submitted:', finalData);
		alert('Listing published successfully!');
		// Redirect to dashboard or listings page
		// navigate('/dashboard');
	};

	const getTimeString = (date) => {
		if (!date) return 'Never';
		const now = new Date();
		const diff = now - date;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return date.toLocaleDateString();
	};

	const renderStep = () => {
		const props = { data: formData, onChange: handleInputChange };

		switch (currentStep) {
			case 1:
				return <Step1PropertyType {...props} />;
			case 2:
				return <Step2Photos {...props} />;
			case 3:
				return <Step3Details {...props} />;
			case 4:
				return <Step4Amenities {...props} />;
			case 5:
				return <Step5Pricing {...props} />;
			case 6:
				return <Step6Availability {...props} />;
			case 7:
				return <Step7Review {...props} onSubmit={handleSubmit} />;
			default:
				return null;
		}
	};

	const isStep1Valid = formData.propertyType && formData.title && formData.location;
	const isStep2Valid = true; // Photos are optional
	const isStep3Valid = formData.bedrooms >= 1 && formData.bathrooms >= 1;
	const isStep4Valid = true; // Amenities optional
	const isStep5Valid = formData.pricePerNight;
	const isStep6Valid = true; // Availability optional
	const isStep7Valid = true; // Final review

	const stepValidation = [
		isStep1Valid,
		isStep2Valid,
		isStep3Valid,
		isStep4Valid,
		isStep5Valid,
		isStep6Valid,
		isStep7Valid
	];

	const canGoNext = stepValidation[currentStep - 1];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<Link to="/dashboard" className="text-blue-600 text-sm hover:underline">
						← Back to Dashboard
					</Link>
					<div className="text-right">
						{lastSaved && (
							<p className="text-xs text-gray-500">
								Last saved {getTimeString(lastSaved)}
							</p>
						)}
						{saveStatus === 'saved' && (
							<p className="text-xs text-green-600 font-medium">✓ Draft auto-saved</p>
						)}
						{saveStatus === 'error' && (
							<p className="text-xs text-red-600 font-medium">✗ Save failed</p>
						)}
					</div>
				</div>

				{/* Progress Indicator */}
				<ProgressIndicator currentStep={currentStep} totalSteps={7} />

				{/* Form Content */}
				<div className="bg-white rounded-lg shadow-md p-8 mb-8">
					{renderStep()}
				</div>

				{/* Navigation Buttons */}
				<div className="flex gap-4 justify-between">
					<button
						onClick={() => goToStep(currentStep - 1)}
						disabled={currentStep === 1}
						className={`
							px-6 py-3 rounded-lg font-semibold transition-colors
							${currentStep === 1
								? 'bg-gray-200 text-gray-600 cursor-not-allowed'
								: 'bg-gray-600 text-white hover:bg-gray-700'}
						`}
					>
						← Previous Step
					</button>

					<div className="flex gap-3">
						<button
							onClick={autoSaveDraft}
							disabled={isSaving}
							className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
						>
							{isSaving ? '💾 Saving...' : '💾 Save Draft'}
						</button>

						{currentStep < 7 ? (
							<button
								onClick={() => goToStep(currentStep + 1)}
								disabled={!canGoNext}
								className={`
									px-6 py-3 rounded-lg font-semibold transition-colors
									${!canGoNext
										? 'bg-gray-200 text-gray-600 cursor-not-allowed'
										: 'bg-blue-600 text-white hover:bg-blue-700'}
								`}
							>
								Next Step →
							</button>
						) : null}
					</div>
				</div>

				{!canGoNext && currentStep < 7 && (
					<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
						⚠️ Please fill in the required fields to continue to the next step.
					</div>
				)}

				{/* Step Shortcuts */}
				<div className="mt-8 p-4 bg-gray-100 rounded-lg">
					<p className="text-sm font-semibold text-gray-700 mb-3">Jump to step:</p>
					<div className="flex flex-wrap gap-2">
						{[1, 2, 3, 4, 5, 6, 7].map(step => (
							<button
								key={step}
								onClick={() => goToStep(step)}
								disabled={!stepValidation.slice(0, step - 1).every(v => v)}
								className={`
									px-3 py-1 rounded text-sm font-medium transition-colors
									${currentStep === step
										? 'bg-blue-600 text-white'
										: !stepValidation.slice(0, step - 1).every(v => v)
										? 'bg-gray-300 text-gray-600 cursor-not-allowed'
										: 'bg-gray-300 text-gray-700 hover:bg-gray-400'}
								`}
							>
								Step {step}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
