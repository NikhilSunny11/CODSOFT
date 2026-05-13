const Job = require('../models/Job');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Allowed job types — single source of truth
const VALID_JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];

/**
 * @route   POST /api/jobs
 * @desc    Create a new job listing (with optional company logo upload)
 * @access  Private (Employer only)
 *
 * NOTE: Validation is done inline (not via express-validator) because
 * this route uses multer for multipart/form-data. express-validator's
 * body() checks can fail to read multer-parsed fields in Express 5.x,
 * causing false "required" / "invalid" errors.
 */
const createJob = async (req, res) => {
  try {
    // ─── Inline validation (runs AFTER multer populates req.body) ──
    const { title, description, location, type, company, companyDescription } = req.body;
    const validationErrors = [];

    if (!title || !title.trim()) {
      validationErrors.push({ msg: 'Job title is required', param: 'title' });
    } else if (title.length > 150) {
      validationErrors.push({ msg: 'Title cannot exceed 150 characters', param: 'title' });
    }

    if (!description || !description.trim()) {
      validationErrors.push({ msg: 'Description is required', param: 'description' });
    } else if (description.length > 5000) {
      validationErrors.push({ msg: 'Description cannot exceed 5000 characters', param: 'description' });
    }

    if (!location || !location.trim()) {
      validationErrors.push({ msg: 'Location is required', param: 'location' });
    }

    if (!type || !VALID_JOB_TYPES.includes(type.trim().toLowerCase())) {
      validationErrors.push({ msg: 'Job type must be full-time, part-time, contract, or internship', param: 'type' });
    }

    if (companyDescription && companyDescription.length > 2000) {
      validationErrors.push({ msg: 'Company description cannot exceed 2000 characters', param: 'companyDescription' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    // ─── Handle optional logo upload to Cloudinary ─────────────────
    let companyLogoUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'company-logos');
      companyLogoUrl = result.secure_url;
    }

    const jobData = {
      title: title.trim(),
      description: description.trim(),
      company: (company && company.trim()) || req.user.company || '',
      companyLogo: companyLogoUrl,
      companyDescription: companyDescription ? companyDescription.trim() : '',
      location: location.trim(),
      type: type.trim().toLowerCase(),
      skills: [],
      postedBy: req.user._id,
      status: 'open',
    };

    // Handle salary (may come as JSON string from FormData)
    if (req.body.salary) {
      try {
        const salary = typeof req.body.salary === 'string'
          ? JSON.parse(req.body.salary)
          : req.body.salary;
        jobData.salary = {
          min: salary.min ? Number(salary.min) : undefined,
          max: salary.max ? Number(salary.max) : undefined,
          currency: salary.currency || 'INR',
        };
      } catch {
        // Ignore malformed salary JSON
      }
    }

    // Handle skills (may come as comma string from FormData)
    if (req.body.skills && typeof req.body.skills === 'string') {
      jobData.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.skills)) {
      jobData.skills = req.body.skills;
    }

    if (req.body.deadline) {
      jobData.deadline = req.body.deadline;
    }

    const job = await Job.create(jobData);

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Create job error:', error);
    // Surface Mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map(e => ({ msg: e.message, param: e.path }));
      return res.status(400).json({ success: false, errors: msgs });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/jobs
 * @desc    Get all open jobs with optional search/filter
 * @access  Public
 *
 * Query params:
 *   ?search=keyword    — text search on title & description
 *   ?location=city     — filter by location
 *   ?type=full-time    — filter by job type
 *   ?page=1&limit=10   — pagination
 */
const getJobs = async (req, res) => {
  try {
    const { search, location, type, page = 1, limit = 12 } = req.query;

    const filter = { status: 'open' };

    // Text search (uses the text index on title + description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name company profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job by ID
 * @access  Public
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'postedBy',
      'name company email profileImage'
    );

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job listing (with optional logo re-upload)
 * @access  Private (Employer, owner only)
 */
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: 'Job not found' });
    }

    // Only the employer who posted it can update
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    // ─── Handle optional logo re-upload ───────────────────────────
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'company-logos');
      req.body.companyLogo = result.secure_url;
    }

    // Handle salary if sent as JSON string from FormData
    if (req.body.salary && typeof req.body.salary === 'string') {
      req.body.salary = JSON.parse(req.body.salary);
    }

    // Handle skills if sent as comma string
    if (typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job listing
 * @access  Private (Employer, owner only)
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: 'Job not found' });
    }

    // Only the employer who posted it can delete
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/jobs/employer/me
 * @desc    Get all jobs posted by the logged-in employer
 * @access  Private (Employer only)
 */
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createJob, getJobs, getJob, updateJob, deleteJob, getMyJobs };
