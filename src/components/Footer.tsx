import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

// Custom Linkedin Icon
function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Custom Instagram Icon
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Custom GitHub Icon
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

// Custom X icon (formerly Twitter)
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

export default function Footer() {
  const platformLinks = [
    { name: 'Browse Categories', href: '/designers' },
    { name: 'Featured Designers', href: '/designers' },
    { name: 'Success Stories', href: '#' },
    { name: 'Fee Structure', href: '#' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '#' },
    { name: 'How It Works', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press Kit', href: '#' },
  ];

  const resourceLinks = [
    { name: 'Design Blog', href: '#' },
    { name: 'Freelancer Guides', href: '#' },
    { name: 'Hiring Playbooks', href: '#' },
    { name: 'Help Center', href: '#' },
  ];

  return (
    <footer id="contact" className="bg-neutral-50 dark:bg-black border-t border-neutral-200 dark:border-neutral-950 pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-neutral-200 dark:border-neutral-900">
          
          {/* Logo & Brand description */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="flex items-center space-x-2.5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
              <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Lanzy</span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
              The direct connection freelancer marketplace designed exclusively for creative designers and world-class product teams.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-none text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary dark:hover:border-neutral-600 transition-colors duration-200" aria-label="LinkedIn">
                <LinkedinIcon size={18} />
              </a>
              <a href="#" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-none text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary dark:hover:border-neutral-600 transition-colors duration-200" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="#" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-none text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary dark:hover:border-neutral-600 transition-colors duration-200" aria-label="X">
                <XIcon size={18} />
              </a>
              <a href="#" className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-none text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary dark:hover:border-neutral-600 transition-colors duration-200" aria-label="GitHub">
                <GithubIcon size={18} />
              </a>
            </div>
          </div>

          {/* Links Column: Platform */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white transition-colors duration-150">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Company */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white transition-colors duration-150">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Resources */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-neutral-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white transition-colors duration-150">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Newsletter Box (Col span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">Newsletter</h4>
            <p className="text-xs text-neutral-550 dark:text-slate-400 mb-3 leading-relaxed">
              Subscribe to get design trends and top freelance availability alerts.
            </p>
            <div className="relative w-full">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3.5 py-3 rounded-none focus:outline-none focus:border-brand-primary transition-colors duration-200"
              />
              <button className="absolute right-2 top-1.25 p-2 bg-brand-primary hover:bg-brand-primary-hover dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-none transition-colors duration-150 cursor-pointer">
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-neutral-450 dark:text-slate-500 font-medium">
          <div>© 2026 Lanzy. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#privacy" className="hover:text-brand-primary dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-brand-primary dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-brand-primary dark:hover:text-white transition-colors">Cookies Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
