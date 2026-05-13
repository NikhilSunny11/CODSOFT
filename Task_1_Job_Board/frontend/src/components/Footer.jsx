import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-950 text-surface-200 mt-auto relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-cyan-600/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo.png" alt="Job Board" className="w-10 h-10 rounded-xl object-contain" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">JobBoard</span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed mb-6">
              Connecting top talent with exceptional opportunities.
              Find your dream job or the perfect candidate.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { name: 'GitHub', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                )},
                { name: 'LinkedIn', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                )},
                { name: 'Twitter', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                )},
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  title={social.name}
                  className="w-10 h-10 rounded-xl bg-surface-800/60 flex items-center justify-center text-surface-400 hover:bg-gradient-to-br hover:from-primary-600 hover:to-cyan-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary-600/20 hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              For Candidates
            </h4>
            <ul className="space-y-3 text-sm text-surface-400">
              <li><Link to="/jobs" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Create Account</Link></li>
              <li><Link to="/candidate-dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">My Applications</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              For Employers
            </h4>
            <ul className="space-y-3 text-sm text-surface-400">
              <li><Link to="/register" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Post a Job</Link></li>
              <li><Link to="/employer-dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Manage Listings</Link></li>
              <li><Link to="/employer-dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">View Applications</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-surface-400">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Career Advice</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Resume Tips</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Interview Prep</a></li>
            </ul>
          </div>
        </div>

        {/* Animated gradient divider */}
        <div className="mt-14 mb-8 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-surface-500">
            Made with care by Nic & Co. &copy; 2026
          </p>
          <p className="text-xs text-surface-600">
            Helping people find their next great opportunity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
