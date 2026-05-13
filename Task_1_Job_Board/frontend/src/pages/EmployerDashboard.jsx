import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiTrash, HiBriefcase, HiUsers, HiClock, HiChevronDown,
  HiPhotograph, HiX, HiOfficeBuilding, HiLocationMarker, HiCurrencyRupee
} from 'react-icons/hi';

const statusColors = {
  pending: 'bg-amber-50 text-amber-600 border border-amber-200/60',
  reviewed: 'bg-blue-50 text-blue-600 border border-blue-200/60',
  accepted: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  rejected: 'bg-red-50 text-red-600 border border-red-200/60',
};

const InputField = ({ label, icon, required, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-semibold text-surface-700 mb-2">
      {icon && <span className="text-primary-500">{icon}</span>}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5 animate-slide-down">{error}</p>}
  </div>
);

const getInputClass = (errors, field) =>
  `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-surface-200 focus:border-primary-500 focus:ring-primary-500/20'} focus:ring-2 outline-none text-sm transition-all duration-300 focus-glow`;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '', description: '', location: '', type: 'full-time',
    skills: '', salary: { min: '', max: '', currency: 'INR' }, deadline: '',
    company: user?.company || '', companyDescription: '',
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (user?.company && !newJob.company) setNewJob(prev => ({ ...prev, company: user.company }));
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [j, a] = await Promise.all([api.get('/jobs/employer/me'), api.get('/applications/employer')]);
      setJobs(j.data.jobs); setApplications(a.data.applications);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return toast.error('Only JPG, JPEG, and PNG files are allowed');
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be less than 2MB');
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => { setLogoFile(null); setLogoPreview(null); };

  const validateForm = () => {
    const errs = {};
    if (!newJob.title.trim()) errs.title = 'Job title is required';
    if (!newJob.description.trim()) errs.description = 'Description is required';
    if (!newJob.location.trim()) errs.location = 'Location is required';
    if (!newJob.company.trim()) errs.company = 'Company name is required';
    if (newJob.title.length > 150) errs.title = 'Title cannot exceed 150 characters';
    if (newJob.description.length > 5000) errs.description = 'Description cannot exceed 5000 characters';
    if (newJob.companyDescription.length > 2000) errs.companyDescription = 'Cannot exceed 2000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCreating(true);
    try {
      const payload = { title: newJob.title, description: newJob.description, location: newJob.location, type: newJob.type, company: newJob.company };
      if (newJob.companyDescription) payload.companyDescription = newJob.companyDescription;
      if (newJob.skills) payload.skills = newJob.skills;
      if (newJob.deadline) payload.deadline = newJob.deadline;
      if (newJob.salary.min || newJob.salary.max) {
        payload.salary = { min: newJob.salary.min ? Number(newJob.salary.min) : undefined, max: newJob.salary.max ? Number(newJob.salary.max) : undefined, currency: 'INR' };
      }
      if (logoFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== undefined && val !== null) formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
        });
        formData.append('companyLogo', logoFile);
        await api.post('/jobs', formData);
      } else {
        await api.post('/jobs', payload);
      }
      toast.success('Job posted successfully!');
      setShowForm(false); setLogoFile(null); setLogoPreview(null); setErrors({});
      setNewJob({ title: '', description: '', location: '', type: 'full-time', skills: '', salary: { min: '', max: '', currency: 'INR' }, deadline: '', company: user?.company || '', companyDescription: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to post job');
    } finally { setCreating(false); }
  };

  const deleteJob = async (id) => { if (!confirm('Delete this job?')) return; try { await api.delete(`/jobs/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };
  const updateStatus = async (id, status) => { try { await api.patch(`/applications/${id}/status`, { status }); toast.success(`Marked ${status}`); fetchData(); } catch { toast.error('Failed'); } };

  const upd = (f, v) => {
    setNewJob(prev => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: undefined }));
  };
  const inputClass = (field) => getInputClass(errors, field);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="animated-gradient-bg rounded-2xl p-8 mb-8 relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-white/40">{user?.company || 'Company'} — Manage your jobs and applications</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 hover:scale-[1.02] shadow-lg transition-all duration-300 cursor-pointer">
            <HiPlus /> Post New Job
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <HiBriefcase />, val: jobs.length, label: 'Jobs Posted', bg: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
          { icon: <HiUsers />, val: applications.length, label: 'Applications', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { icon: <HiClock />, val: applications.filter(a => a.status === 'pending').length, label: 'Pending Review', bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100' }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
            className={`bg-white rounded-2xl border ${s.border} p-6 flex items-center gap-4 card-hover`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg}`}>{s.icon}</div>
            <div><p className="text-2xl font-extrabold text-surface-900">{s.val}</p><p className="text-sm text-surface-500">{s.label}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Create Job Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-surface-200/80 shadow-xl overflow-hidden mb-8 glow-border">
            <div className="bg-gradient-to-r from-primary-50 via-white to-cyan-50 px-8 py-5 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-surface-900">Create New Job Listing</h2>
                <p className="text-sm text-surface-500 mt-0.5">Fill in the details to post a new job</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 cursor-pointer transition-all duration-300"><HiX className="text-xl" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-8">
              {/* Company Info Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HiOfficeBuilding className="text-base" /> Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Company Name" icon={<HiOfficeBuilding />} required error={errors.company}>
                    <input value={newJob.company} onChange={e => upd('company', e.target.value)} className={inputClass('company')} placeholder="Acme Corporation" />
                  </InputField>
                  <InputField label="Company Logo" icon={<HiPhotograph />}>
                    <div className="flex items-center gap-4">
                      {logoPreview ? (
                        <div className="relative group">
                          <img src={logoPreview} alt="Logo preview" className="w-14 h-14 rounded-xl object-cover border border-surface-200 shadow-sm" />
                          <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"><HiX /></button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center text-surface-300 border border-dashed border-surface-300"><HiPhotograph className="text-xl" /></div>
                      )}
                      <label className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer">
                        <span className="text-sm text-surface-500">{logoFile ? logoFile.name : 'JPG, PNG — Max 2MB'}</span>
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={handleLogoChange} className="hidden" />
                      </label>
                    </div>
                  </InputField>
                  <div className="md:col-span-2">
                    <InputField label="Company Description" icon={<HiOfficeBuilding />} error={errors.companyDescription}>
                      <textarea value={newJob.companyDescription} onChange={e => upd('companyDescription', e.target.value)} rows={3} className={`${inputClass('companyDescription')} resize-none`} placeholder="Tell candidates about your company culture, mission, and values..." />
                      <p className="text-xs text-surface-400 mt-1 text-right">{newJob.companyDescription.length}/2000</p>
                    </InputField>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-100 mb-8" />

              {/* Job Details Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HiBriefcase className="text-base" /> Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <InputField label="Job Title" required error={errors.title}>
                      <input value={newJob.title} onChange={e => upd('title', e.target.value)} className={inputClass('title')} placeholder="Senior React Developer" />
                    </InputField>
                  </div>
                  <InputField label="Location" icon={<HiLocationMarker />} required error={errors.location}>
                    <input value={newJob.location} onChange={e => upd('location', e.target.value)} className={inputClass('location')} placeholder="Mumbai, Remote" />
                  </InputField>
                  <InputField label="Job Type" required>
                    <select value={newJob.type} onChange={e => upd('type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm bg-white transition-all duration-300">
                      {['full-time','part-time','contract','internship'].map(t => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                    </select>
                  </InputField>
                  <InputField label="Min Salary (₹)" icon={<HiCurrencyRupee />}>
                    <input type="number" value={newJob.salary.min} onChange={e => setNewJob(prev => ({ ...prev, salary: { ...prev.salary, min: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm focus-glow transition-all duration-300" placeholder="500000" />
                  </InputField>
                  <InputField label="Max Salary (₹)" icon={<HiCurrencyRupee />}>
                    <input type="number" value={newJob.salary.max} onChange={e => setNewJob(prev => ({ ...prev, salary: { ...prev.salary, max: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm focus-glow transition-all duration-300" placeholder="1200000" />
                  </InputField>
                  <InputField label="Skills (comma separated)">
                    <input value={newJob.skills} onChange={e => upd('skills', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm focus-glow transition-all duration-300" placeholder="React, Node.js, MongoDB" />
                  </InputField>
                  <InputField label="Application Deadline">
                    <input type="date" value={newJob.deadline} onChange={e => upd('deadline', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 outline-none text-sm transition-all duration-300" />
                  </InputField>
                  <div className="md:col-span-2">
                    <InputField label="Job Description" required error={errors.description}>
                      <textarea value={newJob.description} onChange={e => upd('description', e.target.value)} rows={6} className={`${inputClass('description')} resize-none`} placeholder="Describe the role, responsibilities, requirements..." />
                      <p className="text-xs text-surface-400 mt-1 text-right">{newJob.description.length}/5000</p>
                    </InputField>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-100">
                <button type="submit" disabled={creating} className="px-8 py-3.5 rounded-xl btn-primary disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2">
                  {creating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting...</>) : (<><HiPlus /> Post Job</>)}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setErrors({}); }} className="px-6 py-3.5 rounded-xl border border-surface-200 text-surface-600 font-medium hover:bg-surface-50 cursor-pointer transition-all duration-300">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-surface-200/80 p-1.5 mb-6 w-fit shadow-sm">
        {['jobs', 'applications'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-md shadow-primary-600/20' : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'}`}>
            {tab === 'jobs' ? `My Jobs (${jobs.length})` : `Applications (${applications.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border p-6"><div className="w-1/3 h-5 shimmer-bg rounded mb-3" /><div className="w-1/2 h-4 shimmer-bg rounded" /></div>)}</div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' ? (
            <motion.div key="jobs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                  <div className="w-16 h-16 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4"><HiBriefcase className="text-2xl text-surface-300" /></div>
                  <h3 className="text-lg font-bold text-surface-800 mb-2">No jobs posted yet</h3>
                  <p className="text-surface-500">Click "Post New Job" above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-surface-200/80 p-6 card-hover">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl object-cover border border-surface-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0"><HiOfficeBuilding /></div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-surface-900">{job.title}</h3>
                            <p className="text-sm text-surface-500 mt-1">{job.location} · <span className="capitalize">{job.type}</span> · <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-surface-100 text-surface-600'}`}>{job.status}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-surface-500 bg-surface-50 px-3 py-1.5 rounded-xl border border-surface-100">{applications.filter(a => a.job?._id === job._id).length} applicants</span>
                          <button onClick={() => deleteJob(job._id)} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-300"><HiTrash /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="apps" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                  <div className="w-16 h-16 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center mb-4"><HiUsers className="text-2xl text-surface-300" /></div>
                  <h3 className="text-lg font-bold text-surface-800 mb-2">No applications yet</h3>
                  <p className="text-surface-500">Applications will appear here when candidates apply</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app, i) => (
                    <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`bg-white rounded-xl border border-surface-200/80 p-6 card-hover status-bar-${app.status}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-surface-900">{app.applicant?.name}</h3>
                          <p className="text-sm text-surface-500">{app.applicant?.email} · Applied for <span className="font-medium text-surface-700">{app.job?.title}</span></p>
                          {app.applicant?.skills?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{app.applicant.skills.map((s,j) => <span key={j} className="px-2 py-0.5 bg-surface-50 text-xs rounded-lg text-surface-600 border border-surface-100">{s}</span>)}</div>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-all duration-300">Resume</a>
                          <div className="relative group">
                            <button className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold capitalize cursor-pointer ${statusColors[app.status]}`}>{app.status} <HiChevronDown className="text-xs" /></button>
                            <div className="absolute right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-10 w-36">
                              {['pending','reviewed','accepted','rejected'].map(s => <button key={s} onClick={() => updateStatus(app._id, s)} className={`w-full text-left px-3 py-2 rounded-xl text-sm capitalize hover:bg-surface-50 cursor-pointer transition-all duration-200 ${app.status === s ? 'font-semibold text-primary-600' : 'text-surface-600'}`}>{s}</button>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default EmployerDashboard;
