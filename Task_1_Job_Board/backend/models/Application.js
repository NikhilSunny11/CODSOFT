const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'accepted', 'rejected'],
        message: 'Status must be pending, reviewed, accepted, or rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications (one applicant per job)
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
