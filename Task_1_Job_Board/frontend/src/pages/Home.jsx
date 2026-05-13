import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiSearch, HiArrowRight, HiShieldCheck, HiLightningBolt, HiUserGroup,
  HiClipboardList, HiDocumentText, HiCheckCircle, HiLocationMarker, HiStar
} from 'react-icons/hi';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ─── Animated Counter Hook ────────────────────────────────────────── */
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) { setCount(target); return; }

    let start = 0;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { ref, displayValue: typeof count === 'number' ? count : target };
};

/* ─── Floating Particles ───────────────────────────────────────────── */
const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
  })), []);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const StatCard = ({ value, label, delay }) => {
  const suf = value.replace(/[0-9]/g, '');
  const { ref, displayValue } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className="glass-card rounded-2xl p-6 text-center shadow-lg card-hover glow-border group"
    >
      <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-violet-500 to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
        {typeof displayValue === 'number' ? `${displayValue}${suf}` : value}
      </div>
      <div className="text-sm text-surface-500 font-medium mt-1.5">{label}</div>
    </motion.div>
  );
};

/* ─── Trust Logos SVG icons ─────────────────────────────────────────── */
const trustBrands = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix'];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch) params.set('search', heroSearch);
    if (heroLocation) params.set('location', heroLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const features = [
    { icon: <HiSearch className="text-2xl" />, title: 'Smart Job Search', description: 'Find the perfect job with powerful search and filtering across hundreds of listings.', color: 'from-primary-500 to-primary-600' },
    { icon: <HiShieldCheck className="text-2xl" />, title: 'Secure Applications', description: 'Upload your resume safely and track your application status in real-time.', color: 'from-cyan-500 to-cyan-600' },
    { icon: <HiLightningBolt className="text-2xl" />, title: 'Instant Matching', description: 'Get matched with roles that fit your skills and career goals.', color: 'from-violet-500 to-violet-600' },
    { icon: <HiUserGroup className="text-2xl" />, title: 'For Employers Too', description: 'Post jobs, review applications, and find the best candidates effortlessly.', color: 'from-accent-500 to-accent-600' },
  ];

  const stats = [
    { value: '500+', label: 'Active Jobs' },
    { value: '10K+', label: 'Candidates' },
    { value: '200+', label: 'Companies' },
    { value: '95%', label: 'Success Rate' },
  ];

  const howItWorks = [
    { icon: <HiClipboardList className="text-2xl" />, step: '01', title: 'Create Profile', description: 'Sign up and build your professional profile with skills and experience.' },
    { icon: <HiSearch className="text-2xl" />, step: '02', title: 'Discover Jobs', description: 'Browse and search through curated job listings that match your expertise.' },
    { icon: <HiDocumentText className="text-2xl" />, step: '03', title: 'Apply & Track', description: 'Submit applications with your resume and track progress in real-time.' },
    { icon: <HiCheckCircle className="text-2xl" />, step: '04', title: 'Get Hired', description: 'Connect with employers and land your dream job opportunity.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Frontend Developer', company: 'TechCorp', text: 'JobBoard helped me find my dream role in just 2 weeks. The application process was seamless!', initial: 'PS', rating: 5 },
    { name: 'Arjun Mehta', role: 'Product Manager', company: 'InnovateCo', text: 'As an employer, posting jobs and reviewing applications has never been easier. Highly recommend!', initial: 'AM', rating: 5 },
    { name: 'Neha Patel', role: 'Data Scientist', company: 'DataFlow', text: 'The skill-matching feature is incredible. I got interviews at companies I never thought would notice me.', initial: 'NP', rating: 5 },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div>
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="gradient-hero-dark relative overflow-hidden noise-overlay">
        {/* Animated Particles */}
        <Particles />

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-3xl glow-orb" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl glow-orb" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 pattern-grid" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-44">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm text-white/80 mb-10"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-400" />
              </span>
              Trusted by 200+ companies worldwide
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.08] tracking-tight"
            >
              Find Your{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-primary-400 to-violet-400 bg-clip-text text-transparent">
                  Dream Job
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C40 2 60 2 100 5.5C140 9 160 2 199 5.5" stroke="url(#underlineGrad)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs><linearGradient id="underlineGrad" x1="0" y1="0" x2="200" y2="0"><stop stopColor="#22d3ee"/><stop offset="0.5" stopColor="#818cf8"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs>
                </svg>
              </span>
              <br />
              Start Today
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Connect with top companies and discover opportunities that match your skills.
              Your next career move is just a click away.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={handleHeroSearch}
              className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl shadow-black/20"
            >
              <div className="flex-1 relative">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Job title, keywords, or skills..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white placeholder-white/30 focus:bg-white/[0.1] focus:border-white/15 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex-1 relative md:border-l border-white/10">
                <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  placeholder="City or remote..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white placeholder-white/30 focus:bg-white/[0.1] focus:border-white/15 outline-none transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl btn-primary text-sm cursor-pointer whitespace-nowrap"
              >
                Search Jobs
              </button>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              <Link
                to="/jobs"
                className="group inline-flex items-center justify-center gap-2.5 btn-primary text-base cursor-pointer"
              >
                Browse All Jobs
                <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 btn-secondary text-base cursor-pointer"
                >
                  Create Free Account
                </Link>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-16"
            >
              <p className="text-xs uppercase tracking-widest text-white/25 font-semibold mb-6">
                Trusted by teams at
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {trustBrands.map((brand) => (
                  <span key={brand} className="text-white/20 font-bold text-lg tracking-wide hover:text-white/40 transition-all duration-300 cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 40 720 40C360 40 0 0 0 0L0 60Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────── */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} value={stat.value} label={stat.label} delay={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-surface-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">JobBoard</span>?
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Everything you need to accelerate your career or find the perfect hire.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group bg-white rounded-2xl border border-surface-200/80 p-7 card-hover glow-border"
              >
                <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 group-hover:shadow-xl transition-all duration-400`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-surface-100/60 to-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-surface-900 mb-4">
              How It <span className="bg-gradient-to-r from-primary-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Get started in just four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary-300 via-cyan-300 to-violet-300 opacity-30" />

            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border-2 border-primary-200 text-primary-600 mb-5 group-hover:border-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/15 transition-all duration-300 relative z-10 group-hover:scale-110">
                  {item.icon}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2.5 text-[10px] font-bold text-primary-400 bg-primary-50 px-2.5 py-0.5 rounded-full">{item.step}</div>
                <h3 className="text-base font-bold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-surface-900 mb-4">
              Loved by <span className="bg-gradient-to-r from-primary-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Hear from people who found their perfect match on JobBoard
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-surface-200/80 p-7 card-hover glow-border relative"
              >
                {/* Quote mark */}
                <div className="absolute top-5 right-6 text-6xl font-serif text-primary-100/80 leading-none select-none">"</div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <HiStar key={j} className="text-amber-400 text-sm" />
                  ))}
                </div>

                <p className="text-surface-600 text-sm leading-relaxed mb-6 relative z-10">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 via-violet-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{t.name}</p>
                    <p className="text-xs text-surface-400">{t.role} at {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="animated-gradient-bg rounded-3xl p-12 md:p-16 text-center relative overflow-hidden noise-overlay"
          >
            <Particles />
            <div className="absolute inset-0 pattern-grid" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl glow-orb" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl glow-orb" style={{ animationDelay: '-3s' }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Ready to Take the Next Step?
              </h2>
              <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
                Join thousands of professionals finding their perfect match on JobBoard.
              </p>
              <Link
                to={user ? '/jobs' : '/register'}
                className="group inline-flex items-center gap-2.5 btn-primary text-base cursor-pointer bg-white !text-primary-700 hover:!bg-white/95"
                style={{ background: 'white', color: '#4338ca' }}
              >
                {user ? 'Explore Jobs' : 'Get Started Free'}
                <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
