import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      toast.success(res.data.message || 'Email sent successfully');
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
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
          <h2 className="text-3xl font-extrabold text-white mb-4">Don't Worry!</h2>
          <p className="text-white/40 leading-relaxed">It happens to the best of us. Enter your email and we'll send you a link to reset your password.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Forgot Password</h1>
            <p className="text-surface-500">Enter your email to receive a reset link</p>
          </div>
          <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-200/50 p-8">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
                  <div className="relative">
                    <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-300 text-sm focus-glow" placeholder="you@example.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-primary disabled:opacity-50 cursor-pointer">
                  {loading ? (<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span>) : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-4"><HiMail className="text-2xl text-emerald-600" /></div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">Check Your Email</h3>
                <p className="text-sm text-surface-500 mb-4">We've sent a password reset link to <span className="font-semibold text-surface-700">{email}</span></p>
                <button onClick={() => { setSent(false); setEmail(''); }} className="text-sm text-primary-600 font-medium hover:text-primary-700 cursor-pointer transition-colors">Send to a different email</button>
              </motion.div>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-surface-500">Remember your password?{' '}<Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Sign in</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
