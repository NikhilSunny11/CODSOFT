const express = require('express');
const { getCompanyProfile } = require('../controllers/companyController');

const router = express.Router();

// @route   GET /api/company/:employerId
// @desc    Get company profile with all posted jobs
// @access  Public
router.get('/:employerId', getCompanyProfile);

module.exports = router;
