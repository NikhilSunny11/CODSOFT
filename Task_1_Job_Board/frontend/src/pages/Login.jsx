import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'employer' ? '/employer-dashboard' : '/candidate-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient-panel items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md text-center">
          <div className="absolute -top-20 -left-10 w-32 h-32 bg-cyan-500/8 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-violet-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/8 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
            <img src="/logo.png" alt="Job Board" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Welcome Back!</h2>
          <p className="text-white/40 leading-relaxed mb-8">Sign in to access your dashboard, track applications, and discover new opportunities tailored to you.</p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/30">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full" />500+ Jobs</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full" />200+ Companies</div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Sign In</h1>
            <p className="text-surface-500">Enter your credentials to continue</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="login-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer transition-colors">
                    {showPassword ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="group w-full py-3.5 rounded-xl btn-primary disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2">
                {loading ? (<span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>)
                  : (<>Sign In <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-surface-500">Don&apos;t have an account?{' '}<Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Create one</Link></p>
              <p className="text-sm"><Link to="/forgot-password" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">Forgot your password?</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
