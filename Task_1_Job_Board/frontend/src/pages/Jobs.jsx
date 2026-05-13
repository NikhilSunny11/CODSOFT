import { useState, useEffect } from 'react';
import { HiSearch, HiLocationMarker, HiAdjustments } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import JobCard from '../components/JobCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      if (type) params.set('type', type);
      params.set('page', currentPage);
      params.set('limit', 12);

      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (user?.role !== 'candidate') return;
    try {
      const { data } = await api.get('/saved-jobs');
      const ids = new Set(data.savedJobs.map((s) => s.jobId?._id || s.jobId));
      setSavedJobIds(ids);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, type]);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setType('');
    setCurrentPage(1);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) return toast.error('Please log in to save jobs');
    const alreadySaved = savedJobIds.has(jobId);
    try {
      if (alreadySaved) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
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

  const typeOptions = [
    { value: '', label: 'All Jobs' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  return (
    <div>
      {/* Search Header */}
      <div className="animated-gradient-bg relative overflow-hidden py-16 noise-overlay">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Find Your Perfect Job</h1>
            <p className="text-white/40 mb-8 text-lg">Search through {total} open positions</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/10 flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, keywords, or skills..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm focus-glow"
              />
            </div>
            <div className="flex-1 relative md:border-l border-surface-200">
              <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or remote..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm focus-glow"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl btn-primary text-sm cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </motion.form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <HiAdjustments className="text-lg" />
            <span>Filter:</span>
          </div>
          {typeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                type === t.value
                  ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-md shadow-primary-600/20'
                  : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm'
              }`}
            >
              {t.label}
            </button>
          ))}

          {(search || location || type) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-300 ml-auto cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </motion.div>

        {/* Results Count */}
        <p className="text-sm text-surface-500 mb-6">
          Showing <span className="font-semibold text-surface-800">{jobs.length}</span> of{' '}
          <span className="font-semibold text-surface-800">{total}</span> jobs
        </p>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-200 p-6">
                <div className="flex justify-between mb-4">
                  <div className="w-12 h-12 shimmer-bg rounded-xl" />
                  <div className="w-20 h-6 shimmer-bg rounded-full" />
                </div>
                <div className="w-3/4 h-5 shimmer-bg rounded mb-2" />
                <div className="w-1/2 h-4 shimmer-bg rounded mb-4" />
                <div className="w-full h-12 shimmer-bg rounded mb-4" />
                <div className="flex gap-2">
                  <div className="w-16 h-6 shimmer-bg rounded-lg" />
                  <div className="w-16 h-6 shimmer-bg rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
              <HiSearch className="text-3xl text-surface-300" />
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">No jobs found</h3>
            <p className="text-surface-500">Try adjusting your search or filters</p>
          </motion.div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-12"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium disabled:opacity-40 hover:bg-surface-50 hover:border-primary-200 transition-all duration-300 cursor-pointer"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-md shadow-primary-600/20'
                    : 'border border-surface-200 hover:bg-surface-50 hover:border-primary-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium disabled:opacity-40 hover:bg-surface-50 hover:border-primary-200 transition-all duration-300 cursor-pointer"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
