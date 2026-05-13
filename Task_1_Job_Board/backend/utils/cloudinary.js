const cloudinary = require('cloudinary').v2;

// ─── Configure Cloudinary from environment variables ──────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer (from multer memoryStorage) to Cloudinary.
 *
 * @param {Buffer} buffer  — The file buffer to upload
 * @param {string} folder  — Cloudinary folder name (e.g. 'company-logos')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, folder = 'company-logos') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'limit' }, // Resize to max 400x400
          { quality: 'auto', fetch_format: 'auto' },  // Auto-optimize
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 *
 * @param {string} publicId — The Cloudinary public ID to delete
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
