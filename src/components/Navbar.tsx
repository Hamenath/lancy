import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScroll } from '@/components/ui/use-scroll';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Bell, Search, Sun, Moon, LogOut, ChevronDown, LayoutDashboard, Layers, PlusSquare } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const scrolled = useScroll(10);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setNotifications(list);
    });

    return unsubscribe;
  }, [user]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Designers', href: '/designers' },
  ];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/designers?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ease-in-out',
        scrolled 
          ? 'border-neutral-200/80 bg-white/80 dark:border-neutral-900/80 dark:bg-black/80 backdrop-blur-md shadow-sm' 
          : 'border-transparent bg-transparent'
      )}
    >
      <nav className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Lanzy</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1.5 md:flex">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  className={cn(
                    "relative px-3 py-2 text-sm font-semibold transition-colors rounded-none",
                    isActive 
                      ? "text-brand-primary dark:text-white" 
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  )}
                  to={link.href}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center: Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center max-w-xs w-full relative">
          <Search className="absolute left-3 size-4 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search designers..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-neutral-900 dark:text-white rounded-none transition-all"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 dark:hover:text-white cursor-pointer rounded-none transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 relative">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 dark:hover:text-white cursor-pointer rounded-none transition-colors flex items-center justify-center"
                >
                  <Bell className="size-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-brand-primary px-1 text-[9px] font-extrabold text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-xl z-50 rounded-none space-y-3 max-h-75 overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Notifications</h4>
                      {notifications.length > 0 && (
                        <button 
                          onClick={async () => {
                            for (const n of notifications) {
                              await updateDoc(doc(db, "notifications", n.id), { read: true });
                            }
                          }}
                          className="text-[10px] text-brand-primary hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-6">No unread notifications.</p>
                    ) : (
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, "notifications", notif.id), { read: true });
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="w-full text-left py-2.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors flex items-start gap-2 cursor-pointer"
                          >
                            <span className="mt-1 flex h-1.5 w-1.5 shrink-0 bg-brand-primary" />
                            <span>{notif.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer rounded-none transition-colors"
                >
                  <div className="size-7 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-white flex items-center justify-center text-xs font-bold">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="size-3.5 text-neutral-500" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-3 w-48 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1.5 shadow-xl z-50 rounded-none">
                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="size-3.5" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/dashboard/requests" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <Layers className="size-3.5" />
                      Proposals
                    </Link>
                    <Link 
                      to="/my-projects" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <Layers className="size-3.5" />
                      My Projects
                    </Link>
                    <Link 
                      to="/add-project" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <PlusSquare className="size-3.5" />
                      Add Project
                    </Link>
                    <hr className="border-neutral-150 dark:border-neutral-900 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="size-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-xs' })}>
                Log in
              </Link>
              <Link to="/register" className={buttonVariants({ variant: 'default', size: 'sm', className: 'text-xs' })}>
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-none"
          >
            {open ? <span className="font-bold text-xs uppercase tracking-wider">Close</span> : <span className="font-bold text-xs uppercase tracking-wider">Menu</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 top-16 bg-white dark:bg-black z-40 flex flex-col p-6 animate-in slide-in-from-right duration-250">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <Search className="absolute left-3 top-3.5 size-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search designers..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-neutral-900 dark:text-white rounded-none"
            />
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 mb-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setOpen(false)}
                className="text-lg font-bold text-neutral-900 dark:text-white hover:text-brand-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'outline', className: 'w-full py-4 text-sm' })}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/requests"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'outline', className: 'w-full py-4 text-sm' })}
                >
                  Requests
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className={buttonVariants({ variant: 'destructive', className: 'w-full py-4 text-sm' })}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'outline', className: 'w-full py-4 text-sm' })}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'default', className: 'w-full py-4 text-sm' })}
                >
                  Join Lanzy
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
