const express = require('express');
const {
  createApplication,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Candidate routes
router.post(
  '/',
  protect,
  authorize('candidate'),
  upload.single('resume'),
  createApplication
);

router.get('/me', protect, authorize('candidate'), getMyApplications);

// Employer routes
router.get('/employer', protect, authorize('employer'), getEmployerApplications);

router.patch(
  '/:id/status',
  protect,
  authorize('employer'),
  updateApplicationStatus
);

module.exports = router;
