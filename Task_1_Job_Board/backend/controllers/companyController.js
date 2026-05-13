const User = require('../models/User');
const Job = require('../models/Job');

/**
 * @route   GET /api/company/:employerId
 * @desc    Get company profile — employer info + all their job listings
 * @access  Public
 */
const getCompanyProfile = async (req, res) => {
  try {
    // Fetch the employer (exclude sensitive fields)
    const employer = await User.findById(req.params.employerId).select(
      'name company bio profileImage createdAt'
    );

    if (!employer || employer.role === 'candidate') {
      // Don't reveal whether user exists — just say "not found"
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Fetch all open jobs posted by this employer
    const jobs = await Job.find({
      postedBy: req.params.employerId,
      status: 'open',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      company: {
        id: employer._id,
        name: employer.company || employer.name,
        ownerName: employer.name,
        bio: employer.bio || '',
        profileImage: employer.profileImage || '',
        memberSince: employer.createdAt,
      },
      jobs,
    });
  } catch (error) {
    console.error('Get company profile error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCompanyProfile };
