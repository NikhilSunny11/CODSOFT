const multer = require('multer');

// ─── Memory storage — buffer goes straight to Cloudinary, no temp files ──
const storage = multer.memoryStorage();

// ─── File filter — only allow JPG / JPEG / PNG logos ──────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG images are allowed for logos'), false);
  }
};

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for company logos
  },
});

module.exports = uploadLogo;
