import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBriefcase, HiClock, HiCheck, HiX, HiEye, HiPencil, HiArrowRight, HiCamera,
  HiHeart, HiLocationMarker, HiOfficeBuilding, HiTrash, HiBookmark, HiChartBar
} from 'react-icons/hi';


const statusColors = {
  pending: 'bg-amber-50 text-amber-600 border border-amber-200/60',
  reviewed: 'bg-blue-50 text-blue-600 border border-blue-200/60',
  accepted: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  rejected: 'bg-red-50 text-red-600 border border-red-200/60',
};
const statusIcons = { pending: <HiClock />, reviewed: <HiEye />, accepted: <HiCheck />, rejected: <HiX /> };

const typeColors = {
  'full-time': 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  'part-time': 'bg-blue-50 text-blue-600 border border-blue-200/60',
  'contract': 'bg-amber-50 text-amber-600 border border-amber-200/60',
  'internship': 'bg-violet-50 text-violet-600 border border-violet-200/60',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const CandidateDashboard = () => {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState({ name: '', skills: '', bio: '' });
  const fileInputRef = useRef(null);

  // Saved Jobs state
  const [activeTab, setActiveTab] = useState('applications');
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchApplications();
    if (user) setProfile({ name: user.name, skills: (user.skills || []).join(', '), bio: user.bio || '' });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'saved') fetchSavedJobs();
  }, [activeTab]);

  const fetchApplications = async () => {
    try { const { data } = await api.get('/applications/me'); setApplications(data.applications); }
    catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const fetchSavedJobs = async () => {
    setSavedLoading(true);
    try {
      const { data } = await api.get('/saved-jobs');
      setSavedJobs(data.savedJobs);
    } catch {
      toast.error('Failed to load saved jobs');
    } finally {
      setSavedLoading(false);
    }
  };

  const handleRemoveSaved = async (savedJobId, jobTitle) => {
    setRemovingId(savedJobId);
    try {
      await api.delete(`/saved-jobs/${savedJobId}`);
      setSavedJobs((prev) => prev.filter((s) => s._id !== savedJobId));
      toast.success(`Removed "${jobTitle}" from saved`);
    } catch {
      toast.error('Failed to remove job');
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { name: profile.name, bio: profile.bio, skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data.user); toast.success('Profile updated!'); setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      return toast.error('Please select a valid image (JPEG, PNG, GIF, or WebP)');
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be less than 2MB');
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const { data } = await api.put('/auth/profile-image', formData);
      updateUser(data.user);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  const profileImgUrl = user?.profileImage ? user.profileImage : null;

  // Stats
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const reviewedCount = applications.filter(a => a.status === 'reviewed').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="animated-gradient-bg rounded-2xl p-8 mb-8 relative overflow-hidden noise-overlay"
      >
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/40">Track your applications and manage your profile</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <HiBriefcase />, val: applications.length, label: 'Total Applied', bg: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
          { icon: <HiClock />, val: pendingCount, label: 'Pending', bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
          { icon: <HiEye />, val: reviewedCount, label: 'Reviewed', bg: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { icon: <HiCheck />, val: acceptedCount, label: 'Accepted', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-3 card-hover`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-extrabold text-surface-900">{s.val}</p>
              <p className="text-xs text-surface-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden sticky top-24 glow-border shadow-lg shadow-surface-200/50"
          >
            <div className="gradient-hero-dark p-6 text-center relative overflow-hidden noise-overlay">
              <div className="absolute inset-0 pattern-grid opacity-15" />
              <div className="relative">
                {/* Profile Image */}
                <div className="relative w-24 h-24 mx-auto mb-3 group">
                  {profileImgUrl ? (
                    <img src={profileImgUrl} alt={user?.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white/15 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/15">
                      <span className="text-3xl font-bold text-white">{getInitials(user?.name)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {uploadingImage ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiCamera className="text-white text-2xl" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-white/40 text-sm">{user?.email}</p>
                <p className="text-white/20 text-xs mt-1">Hover photo to change</p>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {!editing ? (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {user?.bio && <p className="text-sm text-surface-600 mb-4 leading-relaxed">{user.bio}</p>}
                    {user?.skills?.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-surface-700 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {user.skills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-100">{s}</span>)}
                        </div>
                      </div>
                    )}
                    <button onClick={() => setEditing(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:border-primary-200 hover:text-primary-600 cursor-pointer transition-all duration-300">
                      <HiPencil /> Edit Profile
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={handleUpdateProfile}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-2">Profile Photo</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-surface-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer"
                      >
                        {profileImgUrl ? (
                          <img src={profileImgUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center">
                            <HiCamera className="text-surface-400" />
                          </div>
                        )}
                        <span className="text-sm text-surface-500">
                          {uploadingImage ? 'Uploading...' : 'Click to change photo'}
                        </span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1">Name</label>
                      <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm focus-glow transition-all duration-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1">Bio</label>
                      <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm resize-none focus-glow transition-all duration-300" placeholder="Tell employers about yourself..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1">Skills (comma separated)</label>
                      <input value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm focus-glow transition-all duration-300" placeholder="React, JavaScript, CSS" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Save'}</button>
                      <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 cursor-pointer transition-all duration-300">Cancel</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Main Content — Tab Area */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-surface-200/80 p-1.5 shadow-sm"
          >
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-md shadow-primary-600/20'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              <HiBriefcase className="text-base" />
              My Applications
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-500'
              }`}>
                {applications.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-md shadow-primary-600/20'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              <HiHeart className="text-base" />
              Saved Jobs
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-500'
              }`}>
                {savedJobs.length}
              </span>
            </button>
          </motion.div>

          {/* ─── Applications Tab ─────────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeTab === 'applications' && (
              <motion.div key="apps" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-surface-900">My Applications</h2>
                  <Link to="/jobs" className="group text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">Browse More <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" /></Link>
                </div>

                {loading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border p-6"><div className="w-1/3 h-5 shimmer-bg rounded mb-3" /><div className="w-1/2 h-4 shimmer-bg rounded" /></div>)}</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                    <div className="w-16 h-16 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4"><HiBriefcase className="text-2xl text-surface-300" /></div>
                    <h3 className="text-lg font-bold text-surface-800 mb-2">No applications yet</h3>
                    <p className="text-surface-500 mb-5">Start exploring opportunities</p>
                    <Link to="/jobs" className="px-6 py-3 rounded-xl btn-primary inline-block cursor-pointer">Browse Jobs</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app, i) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-white rounded-xl border border-surface-200/80 p-6 card-hover status-bar-${app.status}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <Link to={`/jobs/${app.job?._id}`} className="text-lg font-bold text-surface-900 hover:text-primary-600 transition-colors duration-200">{app.job?.title || 'Job'}</Link>
                            <p className="text-sm text-surface-500 mt-1">{app.job?.company} · {app.job?.location} · <span className="capitalize">{app.job?.type}</span></p>
                            <p className="text-xs text-surface-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold capitalize shrink-0 ${statusColors[app.status]}`}>{statusIcons[app.status]} {app.status}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── Saved Jobs Tab ───────────────────────────────── */}
            {activeTab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-surface-900">Saved Jobs</h2>
                  <Link to="/jobs" className="group text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">Find More <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" /></Link>
                </div>

                {savedLoading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border p-6"><div className="w-1/3 h-5 shimmer-bg rounded mb-3" /><div className="w-1/2 h-4 shimmer-bg rounded" /></div>)}</div>
                ) : savedJobs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                    <div className="w-16 h-16 mx-auto bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                      <HiHeart className="text-2xl text-red-300" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-800 mb-2">No saved jobs yet</h3>
                    <p className="text-surface-500 mb-5">Save jobs you're interested in to review later</p>
                    <Link to="/jobs" className="px-6 py-3 rounded-xl btn-primary inline-block cursor-pointer">Browse Jobs</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((saved, i) => {
                      const job = saved.jobId;
                      if (!job || typeof job === 'string') return null;
                      return (
                        <motion.div
                          key={saved._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-xl border border-surface-200/80 p-6 card-hover group relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-pink-500 rounded-l-xl" />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                  <HiOfficeBuilding className="text-lg" />
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    to={`/jobs/${job._id}`}
                                    className="text-lg font-bold text-surface-900 hover:text-primary-600 transition-colors duration-200 line-clamp-1"
                                  >
                                    {job.title}
                                  </Link>
                                  <p className="text-sm text-surface-500 font-medium">{job.company}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-surface-500">
                                <span className="flex items-center gap-1">
                                  <HiLocationMarker className="text-surface-400" />
                                  {job.location}
                                </span>
                                {job.type && (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[job.type] || 'bg-gray-50 text-gray-600 border border-gray-200/60'}`}>
                                    {job.type}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-surface-400">
                                  <HiBookmark className="text-xs" />
                                  Saved {new Date(saved.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                to={`/jobs/${job._id}`}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all duration-300"
                              >
                                View Job
                              </Link>
                              <button
                                onClick={() => handleRemoveSaved(saved._id, job.title)}
                                disabled={removingId === saved._id}
                                className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer disabled:opacity-50"
                                title="Remove from saved"
                              >
                                {removingId === saved._id ? (
                                  <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <HiTrash className="text-lg" />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateDashboard;
