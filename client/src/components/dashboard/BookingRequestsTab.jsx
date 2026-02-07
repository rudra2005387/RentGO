import React, { useState } from 'react';

export default function BookingRequestsTab({ requests = [] }) {
	const [bookingRequests, setBookingRequests] = useState(requests);
	const [selectedRequest, setSelectedRequest] = useState(null);

	const handleAccept = (id) => {
		setBookingRequests(prev => 
			prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req)
		);
		setSelectedRequest(null);
	};

	const handleDecline = (id, reason = '') => {
		setBookingRequests(prev => 
			prev.map(req => req.id === id ? { ...req, status: 'declined', declineReason: reason } : req)
		);
		setSelectedRequest(null);
	};

	const pending = bookingRequests.filter(r => r.status === 'pending');

	const getStatusColor = (status) => {
		switch(status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'accepted': return 'bg-green-100 text-green-800';
			case 'declined': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="border rounded-lg p-6 bg-white">
			<h2 className="text-lg font-bold mb-4">Booking Requests</h2>

			{pending.length > 0 && (
				<div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
					You have {pending.length} pending request{pending.length !== 1 ? 's' : ''} awaiting response
				</div>
			)}

			<div className="space-y-3">
				{bookingRequests.length > 0 ? bookingRequests.map((request) => (
					<div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
						<div className="flex justify-between items-start gap-4">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<h3 className="font-semibold text-gray-900">{request.guestName || 'Guest'}</h3>
									<span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(request.status)}`}>
										{request.status}
									</span>
								</div>
								<p className="text-sm text-gray-600 mb-2">{request.listingTitle || 'Listing'}</p>
								<div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
									<div>
										<strong>Check-in:</strong> {new Date(request.checkIn).toLocaleDateString()}
									</div>
									<div>
										<strong>Check-out:</strong> {new Date(request.checkOut).toLocaleDateString()}
									</div>
									<div>
										<strong>Guests:</strong> {request.guests}
									</div>
									<div>
										<strong>Total:</strong> ${request.totalPrice || 0}
									</div>
								</div>
								{request.message && (
									<p className="text-sm italic text-gray-700 mt-2 p-2 bg-gray-50 rounded">
										"{request.message}"
									</p>
								)}
								{request.declineReason && (
									<p className="text-sm text-red-700 mt-2 p-2 bg-red-50 rounded">
										<strong>Decline reason:</strong> {request.declineReason}
									</p>
								)}
							</div>

							{request.status === 'pending' && (
								<div className="flex gap-2">
									<button
										onClick={() => setSelectedRequest(request.id)}
										className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
									>
										Decline
									</button>
									<button
										onClick={() => handleAccept(request.id)}
										className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
									>
										Accept
									</button>
								</div>
							)}
						</div>

						{selectedRequest === request.id && (
							<div className="mt-4 pt-4 border-t">
								<p className="text-sm font-medium mb-2">Reason for declining (optional):</p>
								<textarea
									className="w-full p-2 border rounded text-sm mb-3"
									placeholder="Let the guest know why you're declining..."
									rows="3"
									id={`decline-reason-${request.id}`}
								></textarea>
								<div className="flex gap-2">
									<button
										onClick={() => {
											const reason = document.getElementById(`decline-reason-${request.id}`).value;
											handleDecline(request.id, reason);
										}}
										className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
									>
										Confirm Decline
									</button>
									<button
										onClick={() => setSelectedRequest(null)}
										className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				)) : (
					<div className="text-center py-8 text-gray-600">
						<p>No booking requests at this time</p>
					</div>
				)}
			</div>
		</div>
	);
}
