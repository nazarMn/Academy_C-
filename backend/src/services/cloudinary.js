/**
 * cloudinary.js — Cloudinary image upload service
 * Uses cloudinary SDK directly (no multer-storage-cloudinary)
 */
const cloudinary = require('cloudinary').v2;
const { logger } = require('../utils/logger');

// Configure from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} fileBuffer — the file buffer from multer
 * @param {string} folder — Cloudinary folder name
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(fileBuffer, folder = 'exam-archives') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('[Cloudinary] Upload failed:', error.message);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`[Cloudinary] Deleted image: ${publicId}`);
  } catch (err) {
    logger.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
  }
}

module.exports = { uploadImage, deleteImage, cloudinary };
