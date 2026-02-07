import React from 'react';

export default function Step5Pricing({ data, onChange }) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Set your nightly price</h2>
				<p className="text-gray-600">You can adjust this anytime. Consider researching similar properties.</p>
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
				<p className="text-sm text-blue-900">
					💡 <strong>Tip:</strong> Competitive pricing helps your listing get more bookings. Check similar properties in your area to set the right price.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Nightly Rate (USD)
					</label>
					<div className="relative">
						<span className="absolute left-4 top-3 text-gray-500">$</span>
						<input
							type="number"
							value={data.pricePerNight || ''}
							onChange={(e) => onChange({ ...data, pricePerNight: parseFloat(e.target.value) })}
							placeholder="0.00"
							min="0"
							step="0.01"
							className="w-full pl-8 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Cleaning Fee (USD)
					</label>
					<div className="relative">
						<span className="absolute left-4 top-3 text-gray-500">$</span>
						<input
							type="number"
							value={data.cleaningFee || ''}
							onChange={(e) => onChange({ ...data, cleaningFee: parseFloat(e.target.value) })}
							placeholder="0.00"
							min="0"
							step="0.01"
							className="w-full pl-8 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Service Fee % (optional)
					</label>
					<div className="relative">
						<input
							type="number"
							value={data.serviceFeePercent || ''}
							onChange={(e) => onChange({ ...data, serviceFeePercent: parseFloat(e.target.value) })}
							placeholder="0"
							min="0"
							max="100"
							step="0.1"
							className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						<span className="absolute right-4 top-3 text-gray-500">%</span>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Security Deposit (USD)
					</label>
					<div className="relative">
						<span className="absolute left-4 top-3 text-gray-500">$</span>
						<input
							type="number"
							value={data.securityDeposit || ''}
							onChange={(e) => onChange({ ...data, securityDeposit: parseFloat(e.target.value) })}
							placeholder="0.00"
							min="0"
							step="0.01"
							className="w-full pl-8 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Discount for Weekly Stays (%)
					</label>
					<input
						type="number"
						value={data.weeklyDiscount || ''}
						onChange={(e) => onChange({ ...data, weeklyDiscount: parseFloat(e.target.value) })}
						placeholder="e.g., 10"
						min="0"
						max="100"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Discount for Monthly Stays (%)
					</label>
					<input
						type="number"
						value={data.monthlyDiscount || ''}
						onChange={(e) => onChange({ ...data, monthlyDiscount: parseFloat(e.target.value) })}
						placeholder="e.g., 20"
						min="0"
						max="100"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{data.pricePerNight && (
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
					<h3 className="font-semibold mb-3">Price Breakdown (3-night stay example)</h3>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Nightly Rate × 3</span>
							<span>${(data.pricePerNight * 3).toFixed(2)}</span>
						</div>
						{data.cleaningFee && (
							<div className="flex justify-between">
								<span>Cleaning Fee</span>
								<span>${parseFloat(data.cleaningFee).toFixed(2)}</span>
							</div>
						)}
						{data.securityDeposit && (
							<div className="flex justify-between text-gray-600">
								<span>(Security Deposit - Refundable)</span>
								<span>${parseFloat(data.securityDeposit).toFixed(2)}</span>
							</div>
						)}
						<div className="border-t pt-2 flex justify-between font-semibold">
							<span>Total</span>
							<span>${(
								(data.pricePerNight * 3) + 
								(parseInt(data.cleaningFee) || 0)
							).toFixed(2)}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
