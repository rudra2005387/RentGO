const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload image to Cloudinary
 */
exports.uploadImage = async (filePath, folder = 'rentgo') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      width: 1080,
      height: 1080,
      crop: 'fill'
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload multiple images
 */
exports.uploadMultipleImages = async (filePaths, folder = 'rentgo') => {
  try {
    const uploadPromises = filePaths.map(filePath =>
      cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto'
      })
    );

    const results = await Promise.all(uploadPromises);

    return results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));
  } catch (error) {
    console.error('❌ Cloudinary batch upload error:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete image from Cloudinary
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary deletion error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Delete multiple images
 */
exports.deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId =>
      cloudinary.uploader.destroy(publicId)
    );

    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('❌ Cloudinary batch deletion error:', error);
    throw new Error('Failed to delete images');
  }
};

/**
 * Get optimized image URL
 */
exports.getOptimizedImageUrl = (publicId, options = {}) => {
  const { width = 500, height = 500, quality = 'auto' } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    fetch_format: 'auto'
  });
};

/**
 * Rename a resource
 */
exports.renameImage = async (oldPublicId, newPublicId) => {
  try {
    const result = await cloudinary.api.rename_resources([oldPublicId], newPublicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary rename error:', error);
    throw new Error('Failed to rename image');
  }
};

/**
 * Get image metadata
 */
exports.getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('❌ Failed to get image info:', error);
    throw new Error('Failed to get image information');
  }
};
