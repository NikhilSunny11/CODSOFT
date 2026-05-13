const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    // ─── New: Company branding fields ─────────────────────────────────
    companyLogo: {
      type: String, // Cloudinary URL
      default: '',
    },
    companyDescription: {
      type: String,
      maxlength: [2000, 'Company description cannot exceed 2000 characters'],
      default: '',
    },
    // ──────────────────────────────────────────────────────────────────
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
    },
    type: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship'],
        message: 'Type must be full-time, part-time, contract, or internship',
      },
      required: [true, 'Job type is required'],
    },
    skills: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for keyword search on title and description
jobSchema.index({ title: 'text', description: 'text' });

// Compound index for common filters
jobSchema.index({ status: 1, type: 1, location: 1 });

module.exports = mongoose.model('Job', jobSchema);
