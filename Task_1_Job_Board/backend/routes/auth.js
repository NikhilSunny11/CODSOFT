const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, uploadProfileImage, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImage');

const router = express.Router();

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['candidate', 'employer'])
      .withMessage('Role must be candidate or employer'),
  ],
  register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile — with validation
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim()
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('bio').optional()
      .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('company').optional().trim()
      .isLength({ max: 200 }).withMessage('Company name cannot exceed 200 characters'),
  ],
  updateProfile
);

// @route   PUT /api/auth/profile-image
router.put('/profile-image', protect, uploadImage.single('profileImage'), uploadProfileImage);

// @route   POST /api/auth/forgot-password — with validation
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
  ],
  forgotPassword
);

// @route   PUT /api/auth/reset-password/:resettoken — with validation
router.put(
  '/reset-password/:resettoken',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  resetPassword
);

module.exports = router;
