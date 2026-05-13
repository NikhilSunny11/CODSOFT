const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

/**
 * @route   POST /api/saved-jobs
 * @desc    Save a job for the logged-in candidate
 * @access  Private (Candidate only)
 */
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    // Verify the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check for duplicate
    const existing = await SavedJob.findOne({ userId: req.user._id, jobId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({
      userId: req.user._id,
      jobId,
    });

    res.status(201).json({ success: true, savedJob });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/saved-jobs
 * @desc    Get all saved jobs for the logged-in candidate
 * @access  Private (Candidate only)
 */
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user._id })
      .populate('jobId', 'title company location type salary skills status createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: savedJobs.length, savedJobs });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/saved-jobs/:id
 * @desc    Remove a saved job by savedJob ID or by jobId
 * @access  Private (Candidate only)
 */
const removeSavedJob = async (req, res) => {
  try {
    // Try to find by savedJob document ID first, then by jobId
    let savedJob = await SavedJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedJob) {
      // Fallback: treat the param as a jobId
      savedJob = await SavedJob.findOne({
        jobId: req.params.id,
        userId: req.user._id,
      });
    }

    if (!savedJob) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    await savedJob.deleteOne();

    res.json({ success: true, message: 'Job removed from saved list' });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob,
};
