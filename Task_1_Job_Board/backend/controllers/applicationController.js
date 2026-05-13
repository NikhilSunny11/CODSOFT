const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendNewApplicationEmail, sendStatusUpdateEmail } = require('../utils/email');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @route   POST /api/applications
 * @desc    Submit a job application with resume
 * @access  Private (Candidate only)
 */
const createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Verify job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res
        .status(400)
        .json({ success: false, message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existingApp) {
      return res
        .status(409)
        .json({ success: false, message: 'You have already applied for this job' });
    }

    // Handle resume upload
    let resumeUrl = '';
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'jobboard/resumes',
          resource_type: 'raw',
          public_id: `resume_${req.user._id}_${Date.now()}`,
        });
        resumeUrl = result.secure_url;

        // Clean up local temp file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // If Cloudinary fails, use local path as fallback
        console.warn('Cloudinary upload failed, using local storage:', uploadError.message);
        resumeUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Resume file is required' });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resumeUrl,
      coverLetter,
    });

    // Populate for response
    await application.populate([
      { path: 'job', select: 'title company postedBy' },
      { path: 'applicant', select: 'name email' },
    ]);

    // Send email notification to the employer (fire-and-forget)
    try {
      const employer = await User.findById(job.postedBy).select('name email');
      if (employer) {
        sendNewApplicationEmail({
          employerEmail: employer.email,
          employerName: employer.name,
          candidateName: application.applicant.name,
          jobTitle: job.title,
        }).catch((err) => console.error('Email send error:', err.message));
      }
    } catch (emailErr) {
      console.warn('Could not send application notification email:', emailErr.message);
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create application error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/applications/me
 * @desc    Get all applications submitted by the logged-in candidate
 * @access  Private (Candidate only)
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/applications/employer
 * @desc    Get all applications for jobs posted by the logged-in employer
 * @access  Private (Employer only)
 */
const getEmployerApplications = async (req, res) => {
  try {
    // First, find all jobs posted by this employer
    const myJobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const jobIds = myJobs.map((job) => job._id);

    // Then, find all applications for those jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location')
      .populate('applicant', 'name email skills')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status (reviewed, accepted, rejected)
 * @access  Private (Employer only)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, reviewed, accepted, or rejected',
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company postedBy')
      .populate('applicant', 'name email');

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: 'Application not found' });
    }

    // Verify the employer owns the job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    application.status = status;
    await application.save();

    // Send email notification to the candidate (fire-and-forget)
    if (status !== 'pending') {
      sendStatusUpdateEmail({
        candidateEmail: application.applicant.email,
        candidateName: application.applicant.name,
        jobTitle: application.job.title,
        company: application.job.company,
        newStatus: status,
      }).catch((err) => console.error('Status email error:', err.message));
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
};
