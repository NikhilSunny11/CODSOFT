import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      <div className="hidden lg:flex lg:w-1/2 auth-gradient-panel items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md text-center">
          <div className="absolute -top-20 -left-10 w-32 h-32 bg-cyan-500/8 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-violet-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/8 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
            <img src="/logo.png" alt="Job Board" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Almost There!</h2>
          <p className="text-white/40 leading-relaxed">Create a strong password to keep your account secure.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Reset Password</h1>
            <p className="text-surface-500">Enter your new password below</p>
          </div>
          <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-surface-700 mb-2">New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="Enter new password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer transition-colors">{showPassword ? <HiEyeOff /> : <HiEye />}</button>
                </div>
                <PasswordStrength password={password} />
              </div>
              <button type="submit" disabled={loading}
                className="group w-full py-3.5 rounded-xl btn-primary disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                {loading ? (<span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span>)
                  : (<>Reset Password <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-surface-500"><Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Back to Login</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
