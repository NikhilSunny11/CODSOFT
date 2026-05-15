const multer = require('multer');

// Use memory storage — the file buffer is held in memory and
// streamed directly to Cloudinary. This avoids needing a writable
// local filesystem (important for Render / serverless deployments).
const storage = multer.memoryStorage();

// File filter — only allow PDF, DOC, DOCX for resumes
// and JPG, PNG, WEBP for images (logos, profile pics)
const fileFilter = (req, file, cb) => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const imageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const allowedTypes = [...documentTypes, ...imageTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, and WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;
