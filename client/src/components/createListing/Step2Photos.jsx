import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Step2Photos({ data, onChange }) {
	const [draggedIndex, setDraggedIndex] = useState(null);

	const pushFiles = useCallback((files) => {
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const newPhotos = [...(data.photos || []), event.target.result];
				onChange({ ...data, photos: newPhotos });
			};
			reader.readAsDataURL(file);
		});
	}, [data, onChange]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: pushFiles,
		accept: { 'image/*': [] },
		multiple: true,
	});

	const removePhoto = (index) => {
		const newPhotos = data.photos.filter((_, i) => i !== index);
		onChange({ ...data, photos: newPhotos });
	};

	const reorderPhotos = (fromIndex, toIndex) => {
		const newPhotos = [...data.photos];
		const [movedPhoto] = newPhotos.splice(fromIndex, 1);
		newPhotos.splice(toIndex, 0, movedPhoto);
		onChange({ ...data, photos: newPhotos });
	};

	const handleDragStart = (index) => setDraggedIndex(index);

	const handleDragOver = (e, index) => {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== index) {
			reorderPhotos(draggedIndex, index);
			setDraggedIndex(index);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Upload photos of your property</h2>
				<p className="text-gray-600">First photo will be your listing cover. You can reorder by dragging.</p>
			</div>

			<div
				{...getRootProps()}
				className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
					isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
				}`}
			>
				<input {...getInputProps()} />
				<div className="text-4xl mb-2">📸</div>
				<p className="font-medium text-gray-700">Drag & drop images here</p>
				<p className="text-sm text-gray-500 mt-1">or click to select files</p>
			</div>

			{data.photos && data.photos.length > 0 && (
				<div>
					<h3 className="font-semibold mb-3">Uploaded Photos ({data.photos.length})</h3>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{data.photos.map((photo, index) => (
							<div
								key={index}
								draggable
								onDragStart={() => handleDragStart(index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDragEnd={() => setDraggedIndex(null)}
								className="relative group cursor-move rounded-lg overflow-hidden"
							>
								<img
									src={photo}
									alt={`Photo ${index + 1}`}
									className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
								/>
								{index === 0 && (
									<div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
										Cover
									</div>
								)}
								<button
									onClick={() => removePhoto(index)}
									className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
								>
									✕
								</button>
								<div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
									{index === 0 ? 'Drag to reorder' : `#${index + 1}`}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
