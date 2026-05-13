import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiOfficeBuilding, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-surface-200'}`} />))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}>{labels[strength]}</p>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'candidate', company: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.role === 'employer' && !formData.company.trim()) return toast.error('Company name is required for employers');
    setLoading(true);
    try {
      const payload = { name: formData.name, email: formData.email, password: formData.password, role: formData.role };
      if (formData.role === 'employer') payload.company = formData.company;
      const data = await register(payload);
      toast.success(`Welcome, ${data.user.name}! Account created.`);
      navigate(data.user.role === 'employer' ? '/employer-dashboard' : '/candidate-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 auth-gradient-panel items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md text-center">
          <div className="absolute -top-20 -left-10 w-32 h-32 bg-cyan-500/8 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-violet-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/8 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
            <img src="/logo.png" alt="Job Board" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Start Your Journey</h2>
          <p className="text-white/40 leading-relaxed mb-8">Join thousands of professionals and companies. Whether you're looking for your next role or your next hire — we've got you covered.</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/30">
            <div className="bg-white/5 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/5"><div className="text-xl font-bold text-white/60 mb-1">10K+</div>Candidates</div>
            <div className="bg-white/5 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/5"><div className="text-xl font-bold text-white/60 mb-1">95%</div>Success Rate</div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Create Account</h1>
            <p className="text-surface-500">Join JobBoard and start your journey</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {['candidate', 'employer'].map((role) => (
                    <button key={role} type="button" onClick={() => update('role', role)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all duration-300 cursor-pointer ${
                        formData.role === role
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
                          : 'border-surface-200 text-surface-600 hover:border-surface-300'
                      }`}>
                      {role === 'candidate' ? '🎯 Candidate' : '🏢 Employer'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="reg-name" className="block text-sm font-semibold text-surface-700 mb-2">Full Name</label>
                <div className="relative">
                  <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="reg-name" type="text" required value={formData.name} onChange={(e) => update('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="John Doe" />
                </div>
              </div>
              {formData.role === 'employer' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label htmlFor="reg-company" className="block text-sm font-semibold text-surface-700 mb-2">Company Name</label>
                  <div className="relative">
                    <HiOfficeBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input id="reg-company" type="text" value={formData.company} onChange={(e) => update('company', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="Acme Corp" />
                  </div>
                </motion.div>
              )}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="reg-email" type="email" required value={formData.email} onChange={(e) => update('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} required minLength={6} value={formData.password} onChange={(e) => update('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer transition-colors">{showPassword ? <HiEyeOff /> : <HiEye />}</button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-semibold text-surface-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="reg-confirm" type="password" required value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-300 text-sm focus-glow ${
                      formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                    }`} placeholder="Re-enter your password" />
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (<p className="text-xs text-red-500 mt-1">Passwords don't match</p>)}
              </div>
              <button type="submit" disabled={loading}
                className="group w-full py-3.5 rounded-xl btn-primary disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2 mt-2">
                {loading ? (<span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span>)
                  : (<>Create Account <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-surface-500">Already have an account?{' '}<Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Sign in</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
