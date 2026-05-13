import { Link } from 'react-router-dom';
import { HiLocationMarker, HiClock, HiCurrencyRupee, HiArrowRight, HiHeart } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const typeColors = {
  'full-time': 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  'part-time': 'bg-blue-50 text-blue-600 border border-blue-200/60',
  'contract': 'bg-amber-50 text-amber-600 border border-amber-200/60',
  'internship': 'bg-violet-50 text-violet-600 border border-violet-200/60',
};

const avatarColors = [
  'from-primary-500 to-primary-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-700',
  'from-pink-500 to-rose-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-cyan-500 to-blue-700',
];

const JobCard = ({ job, isSaved = false, onToggleSave }) => {
  const { user } = useAuth();

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)}`;
    if (salary.min) return `From ₹${fmt(salary.min)}`;
    return `Up to ₹${fmt(salary.max)}`;
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const colorIndex = (job.company || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;
  const initial = (job.company || 'C')[0].toUpperCase();
  const employerId = job.postedBy?._id || job.postedBy;

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) onToggleSave(job._id);
  };

  const handleCompanyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (employerId) {
      window.location.href = `/company/${employerId}`;
    }
  };

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group block bg-white rounded-2xl border border-surface-200/80 p-6 card-hover gradient-border-top glow-border relative overflow-hidden"
    >
      {/* Subtle hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-cyan-50/0 group-hover:from-primary-50/30 group-hover:to-cyan-50/20 transition-all duration-500 rounded-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          {/* Company avatar or logo */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-12 h-12 rounded-xl object-cover shadow-sm border border-surface-100 shrink-0 group-hover:shadow-md transition-shadow duration-300"
            />
          ) : (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
              {initial}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[job.type] || 'bg-gray-50 text-gray-600 border border-gray-200/60'}`}
            >
              {job.type}
            </span>
            {/* Save button */}
            {user?.role === 'candidate' && onToggleSave && (
              <button
                onClick={handleSaveClick}
                className={`save-heart-btn p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  isSaved
                    ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-surface-300 hover:text-red-400 hover:bg-red-50'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <HiHeart className={`text-lg ${isSaved ? 'heart-saved' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors duration-300 mb-1 line-clamp-1">
          {job.title}
        </h3>
        {/* Clickable company name → company profile */}
        <button
          onClick={handleCompanyClick}
          className="text-sm text-surface-500 font-medium mb-3 hover:text-primary-600 hover:underline transition-colors duration-200 cursor-pointer text-left"
        >
          {job.company}
        </button>

        <p className="text-sm text-surface-500 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Tags */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-surface-50 text-surface-600 text-xs font-medium rounded-lg border border-surface-100 group-hover:bg-primary-50/80 group-hover:text-primary-600 group-hover:border-primary-100 transition-all duration-300"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2.5 py-1 text-primary-500 text-xs font-semibold">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 pt-4 border-t border-surface-100">
          <span className="flex items-center gap-1.5">
            <HiLocationMarker className="text-surface-400" />
            {job.location}
          </span>
          {formatSalary(job.salary) && (
            <span className="flex items-center gap-1.5">
              <HiCurrencyRupee className="text-surface-400" />
              {formatSalary(job.salary)}
            </span>
          )}
          <span className="flex items-center gap-1.5 ml-auto">
            <HiClock className="text-surface-400" />
            {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* View Details link */}
        <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          View Details <HiArrowRight className="text-sm" />
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
