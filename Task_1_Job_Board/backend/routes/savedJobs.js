const express = require('express');
const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require('../controllers/savedJobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected — candidate only
router.post('/', protect, authorize('candidate'), saveJob);
router.get('/', protect, authorize('candidate'), getSavedJobs);
router.delete('/:id', protect, authorize('candidate'), removeSavedJob);

module.exports = router;
