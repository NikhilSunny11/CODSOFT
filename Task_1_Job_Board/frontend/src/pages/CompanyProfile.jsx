import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  HiOfficeBuilding, HiLocationMarker, HiCalendar, HiBriefcase,
  HiArrowLeft, HiExternalLink, HiUsers, HiDocumentText
} from 'react-icons/hi';

const CompanyProfile = () => {
  const { employerId } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await api.get(`/company/${employerId}`);
        setCompany(data.company);
        setJobs(data.jobs);
      } catch {
        toast.error('Company not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [employerId]);

  useEffect(() => {
    const fetchSaved = async () => {
      if (user?.role !== 'candidate') return;
      try {
        const { data } = await api.get('/saved-jobs');
        setSavedJobIds(new Set(data.savedJobs.map((s) => s.jobId?._id || s.jobId)));
      } catch {
        // Silently fail
      }
    };
    fetchSaved();
  }, [user]);

  const handleToggleSave = async (jobId) => {
    if (!user) return toast.error('Please log in to save jobs');
    const alreadySaved = savedJobIds.has(jobId);
    try {
      if (alreadySaved) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
        toast.success('Job removed from saved');
      } else {
        await api.post('/saved-jobs', { jobId });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
        toast.success('Job saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="gradient-hero p-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 shimmer-bg rounded-2xl" />
              <div>
                <div className="w-48 h-8 shimmer-bg rounded mb-3" />
                <div className="w-32 h-5 shimmer-bg rounded" />
              </div>
            </div>
          </div>
          <div className="p-8 space-y-4">
            <div className="w-full h-4 shimmer-bg rounded" />
            <div className="w-3/4 h-4 shimmer-bg rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
          <HiOfficeBuilding className="text-3xl text-surface-300" />
        </div>
        <h2 className="text-xl font-bold text-surface-800 mb-2">Company Not Found</h2>
        <p className="text-surface-500 mb-6">This company page doesn't exist or has been removed.</p>
        <Link to="/jobs" className="px-6 py-3 rounded-xl btn-primary inline-block cursor-pointer">
          Browse Jobs
        </Link>
      </div>
    );
  }

  const logoUrl = jobs.find(j => j.companyLogo)?.companyLogo || '';
  const companyDescription = jobs.find(j => j.companyDescription)?.companyDescription || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 mb-6 transition-colors duration-200">
          <HiArrowLeft /> Back to Jobs
        </Link>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 overflow-hidden glow-border mb-8"
        >
          <div className="gradient-hero-dark p-8 md:p-12 relative overflow-hidden noise-overlay">
            <div className="absolute inset-0 pattern-grid opacity-15" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Company Logo */}
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-4 ring-white/15 shadow-xl bg-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/15">
                  <HiOfficeBuilding className="text-4xl text-white/70" />
                </div>
              )}

              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{company.name}</h1>
                <p className="text-white/50 font-medium mb-4">{company.ownerName}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-white/50 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                    <HiBriefcase className="text-cyan-400" /> {jobs.length} open {jobs.length === 1 ? 'position' : 'positions'}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/50 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                    <HiCalendar className="text-cyan-400" /> Since {new Date(company.memberSince).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Description */}
          {(company.bio || companyDescription) && (
            <div className="p-8 border-b border-surface-100">
              <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="text-primary-500" /> About the Company
              </h2>
              <p className="text-surface-600 leading-relaxed whitespace-pre-wrap">
                {companyDescription || company.bio}
              </p>
            </div>
          )}
        </motion.div>

        {/* Jobs Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-900">
            Open Positions ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
            <div className="w-16 h-16 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
              <HiBriefcase className="text-2xl text-surface-300" />
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">No open positions</h3>
            <p className="text-surface-500">This company doesn't have any open positions right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSaved={savedJobIds.has(job._id)}
                onToggleSave={user?.role === 'candidate' ? handleToggleSave : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CompanyProfile;
