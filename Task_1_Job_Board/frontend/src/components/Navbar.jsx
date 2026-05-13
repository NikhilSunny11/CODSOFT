import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    return user.role === 'employer' ? '/employer-dashboard' : '/candidate-dashboard';
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'text-primary-600 bg-primary-50/80 shadow-sm shadow-primary-500/5'
        : 'text-surface-600 hover:text-primary-600 hover:bg-primary-50/50'
    }`;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const profileImgUrl = user?.profileImage ? user.profileImage : null;

  // Determine if we're on hero page for transparent nav
  const isHeroPage = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-card-scrolled shadow-lg'
          : isHeroPage
            ? 'bg-transparent'
            : 'glass-card'
      } border-b ${scrolled ? 'border-surface-200/60' : 'border-transparent'}`}
    >
      {/* Animated gradient line at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-cyan-400 to-violet-500 transition-opacity duration-500 ${scrolled ? 'opacity-30' : 'opacity-0'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <img src="/logo.png" alt="Job Board" className="relative w-10 h-10 rounded-xl object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
              JobBoard
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link to="/jobs" className={navLinkClass('/jobs')}>
              Browse Jobs
              {isActive('/jobs') && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className={navLinkClass(getDashboardLink())}>
                  Dashboard
                  {isActive(getDashboardLink()) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
                <div className="w-px h-6 bg-surface-200/60 mx-3" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    {profileImgUrl ? (
                      <img src={profileImgUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-md" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 via-violet-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-md">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-surface-800 leading-tight">{user.name}</p>
                      <p className="text-xs text-surface-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass('/login')}>Sign In</Link>
                <Link to="/register" className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white btn-primary cursor-pointer">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl text-surface-600 hover:bg-surface-100/80 cursor-pointer transition-all duration-300">
            {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 top-[72px] bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden relative z-50 py-4 border-t border-surface-200/50 bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-2xl"
              >
                <div className="flex flex-col gap-1.5 px-2">
                  <Link to="/jobs" className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive('/jobs') ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:bg-surface-50'}`}>
                    Browse Jobs
                  </Link>
                  {user ? (
                    <>
                      <Link to={getDashboardLink()} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(getDashboardLink()) ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:bg-surface-50'}`}>
                        Dashboard
                      </Link>
                      <div className="h-px bg-surface-200/60 my-2 mx-4" />
                      <div className="px-4 py-2 flex items-center gap-3">
                        {profileImgUrl ? (
                          <img src={profileImgUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 via-violet-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-md">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-surface-800">{user.name}</p>
                          <p className="text-xs text-surface-400 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout} className="mx-2 mt-1 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left cursor-pointer transition-all duration-300">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive('/login') ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:bg-surface-50'}`}>
                        Sign In
                      </Link>
                      <Link to="/register" className="mx-2 mt-2 px-5 py-3 rounded-xl text-sm font-bold text-white btn-primary text-center">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
