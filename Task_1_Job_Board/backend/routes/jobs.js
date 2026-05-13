const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const uploadLogo = require('../middleware/uploadLogo');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/employer/me', protect, authorize('employer'), getMyJobs);
router.get('/:id', getJob);

// Protected routes (Employer only)
// NOTE: Validation is done inside the controller (not via express-validator)
// because these routes use multer for multipart/form-data parsing.
// express-validator body() checks can fail to read multer-parsed fields
// reliably in Express 5.x, causing false "required" errors.
router.post(
  '/',
  protect,
  authorize('employer'),
  uploadLogo.single('companyLogo'),
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('employer'),
  uploadLogo.single('companyLogo'),
  updateJob
);

router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
