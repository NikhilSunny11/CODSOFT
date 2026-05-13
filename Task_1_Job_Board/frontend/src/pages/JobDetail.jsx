import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiLocationMarker, HiClock, HiCurrencyRupee, HiOfficeBuilding,
  HiBriefcase, HiCalendar, HiArrowLeft, HiUpload, HiShare, HiChevronRight, HiHeart
} from 'react-icons/hi';

const typeColors = {
  'full-time': 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  'part-time': 'bg-blue-50 text-blue-600 border border-blue-200/60',
  'contract': 'bg-amber-50 text-amber-600 border border-amber-200/60',
  'internship': 'bg-violet-50 text-violet-600 border border-violet-200/60',
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Check if job is saved
  useEffect(() => {
    const checkSaved = async () => {
      if (user?.role !== 'candidate') return;
      try {
        const { data } = await api.get('/saved-jobs');
        const saved = data.savedJobs.some((s) => (s.jobId?._id || s.jobId) === id);
        setIsSaved(saved);
      } catch {
        // Silently fail
      }
    };
    checkSaved();
  }, [user, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) return toast.error('Please select a resume file');

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('resume', resume);
      if (coverLetter) formData.append('coverLetter', coverLetter);

      await api.post('/applications', formData);
      toast.success('Application submitted successfully!');
      setShowApplyForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) return toast.error('Please log in to save jobs');
    setSavingJob(true);
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${id}`);
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await api.post('/saved-jobs', { jobId: id });
        setIsSaved(true);
        toast.success('Job saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSavingJob(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    if (salary.min && salary.max) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
    if (salary.min) return `From ${fmt(salary.min)}`;
    return `Up to ${fmt(salary.max)}`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const employerId = job?.postedBy?._id || job?.postedBy;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="w-32 h-4 shimmer-bg rounded mb-8" />
        <div className="bg-white rounded-2xl border border-surface-200 p-8">
          <div className="w-3/4 h-8 shimmer-bg rounded mb-4" />
          <div className="w-1/2 h-5 shimmer-bg rounded mb-8" />
          <div className="space-y-3">
            <div className="w-full h-4 shimmer-bg rounded" />
            <div className="w-full h-4 shimmer-bg rounded" />
            <div className="w-2/3 h-4 shimmer-bg rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors duration-200">Home</Link>
          <HiChevronRight className="text-xs" />
          <Link to="/jobs" className="hover:text-primary-600 transition-colors duration-200">Jobs</Link>
          <HiChevronRight className="text-xs" />
          <span className="text-surface-600 font-medium truncate max-w-[200px]">{job.title}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 overflow-hidden glow-border"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-50 via-white to-cyan-50 p-8 border-b border-surface-200 relative overflow-hidden">
            <div className="absolute inset-0 pattern-grid opacity-20" />
            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-16 h-16 rounded-xl object-cover shadow-md border border-surface-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center text-primary-600 border border-surface-100">
                      <HiOfficeBuilding className="text-2xl" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-surface-900">{job.title}</h1>
                    <Link
                      to={`/company/${employerId}`}
                      className="text-surface-600 font-medium hover:text-primary-600 hover:underline transition-colors duration-200"
                    >
                      {job.company}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold capitalize shrink-0 ${typeColors[job.type]}`}>
                  {job.type}
                </span>
                {user?.role === 'candidate' && (
                  <button
                    onClick={handleToggleSave}
                    disabled={savingJob}
                    className={`save-heart-btn p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSaved
                        ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                        : 'text-surface-400 border-surface-200 hover:text-red-400 hover:border-red-200 hover:bg-red-50'
                    } disabled:opacity-50`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <HiHeart className={`text-lg ${isSaved ? 'heart-saved' : ''}`} />
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-surface-200 text-surface-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  title="Copy link"
                >
                  <HiShare className="text-lg" />
                </button>
              </div>
            </div>

            {/* Quick info */}
            <div className="relative flex flex-wrap gap-3 mt-6">
              {[
                { icon: <HiLocationMarker />, text: job.location },
                formatSalary(job.salary) && { icon: <HiCurrencyRupee />, text: formatSalary(job.salary) },
                { icon: <HiBriefcase />, text: job.status, capitalize: true },
                { icon: <HiCalendar />, text: `Posted ${new Date(job.createdAt).toLocaleDateString()}` },
                job.deadline && { icon: <HiClock />, text: `Deadline: ${new Date(job.deadline).toLocaleDateString()}`, urgent: true },
              ].filter(Boolean).map((item, i) => (
                <span key={i} className={`flex items-center gap-1.5 text-sm text-surface-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-surface-100 ${item.capitalize ? 'capitalize' : ''}`}>
                  <span className={item.urgent ? 'text-red-500' : 'text-primary-500'}>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Company Description */}
            {job.companyDescription && (
              <div className="mb-8 bg-gradient-to-r from-surface-50 to-primary-50/30 rounded-xl p-6 border border-surface-100">
                <h2 className="text-lg font-bold text-surface-900 mb-2 flex items-center gap-2">
                  <HiOfficeBuilding className="text-primary-500" /> About {job.company}
                </h2>
                <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                  {job.companyDescription}
                </p>
                <Link
                  to={`/company/${employerId}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-3 transition-colors duration-200"
                >
                  View all jobs from this company →
                </Link>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-surface-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl border border-primary-100 hover:bg-primary-100 transition-colors duration-200"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-surface-900 mb-3">Job Description</h2>
              <div className="prose prose-sm max-w-none text-surface-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Apply Button */}
            {user?.role === 'candidate' && job.status === 'open' && (
              <div className="border-t border-surface-200 pt-6">
                <AnimatePresence mode="wait">
                  {!showApplyForm ? (
                    <motion.button
                      key="apply-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowApplyForm(true)}
                      className="group px-8 py-3.5 rounded-xl btn-primary text-base inline-flex items-center gap-2 cursor-pointer"
                    >
                      Apply for this Job
                      <HiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  ) : (
                    <motion.form
                      key="apply-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleApply}
                      className="space-y-5 bg-gradient-to-r from-surface-50 to-primary-50/20 rounded-xl p-6 border border-surface-200"
                    >
                      <h3 className="text-lg font-bold text-surface-900">Submit Application</h3>

                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">
                          Resume (PDF, DOC, DOCX)
                        </label>
                        <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-surface-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer">
                          <HiUpload className="text-surface-400 text-xl" />
                          <span className="text-sm text-surface-500">
                            {resume ? resume.name : 'Click to upload your resume'}
                          </span>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} className="hidden" />
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Cover Letter (Optional)</label>
                        <textarea
                          value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm resize-none focus-glow"
                          placeholder="Tell the employer why you're a great fit..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button type="submit" disabled={applying}
                          className="px-6 py-3 rounded-xl btn-primary text-sm disabled:opacity-50 cursor-pointer">
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button type="button" onClick={() => setShowApplyForm(false)}
                          className="px-6 py-3 rounded-xl border border-surface-200 text-surface-600 font-medium hover:bg-surface-50 transition-all duration-300 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!user && (
              <div className="border-t border-surface-200 pt-6 text-center">
                <p className="text-surface-500 mb-3">Want to apply for this job?</p>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 btn-primary text-base cursor-pointer"
                >
                  Sign in to Apply
                  <HiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JobDetail;
