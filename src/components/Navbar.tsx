import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScroll } from '@/components/ui/use-scroll';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import type { AppNotification } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { Bell, Search, Sun, Moon, LogOut, ChevronDown, LayoutDashboard, Layers, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const scrolled = useScroll(10);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadMsgCount(0);
      return;
    }

    async function loadNotificationsAndUnread() {
      try {
        const notifs = await notificationService.getMyNotifications();
        setNotifications(notifs.filter((n) => !n.readAt));
        const unreadCount = await chatService.getUnreadCount();
        setUnreadMsgCount(unreadCount);
      } catch (err) {
        console.error("Error fetching navbar notifications:", err);
      }
    }

    loadNotificationsAndUnread();
    const interval = setInterval(loadNotificationsAndUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Freelancers', href: '/freelancers' },
    { name: 'Projects', href: '/projects' },
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
      navigate(`/freelancers?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setOpen(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = async () => {
    await notificationService.markAllAsRead();
    setNotifications([]);
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
            <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Lancy</span>
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
            placeholder="Search freelancers..."
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
              {/* Chat Icon */}
              <Link
                to="/chat"
                className="relative p-2 border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 dark:hover:text-white cursor-pointer rounded-none transition-colors flex items-center justify-center"
              >
                <MessageSquare className="size-4" />
                {unreadMsgCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-blue-600 px-1 text-[9px] font-extrabold text-white">
                    {unreadMsgCount}
                  </span>
                )}
              </Link>

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
                          onClick={handleClearAllNotifications}
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
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="w-full text-left py-2.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors flex items-start gap-2 cursor-pointer"
                          >
                            <span className="mt-1 flex h-1.5 w-1.5 shrink-0 bg-brand-primary" />
                            <div>
                              <p className="font-bold text-white text-[11px]">{notif.title}</p>
                              <p className="text-[10px] text-neutral-400">{notif.message}</p>
                            </div>
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
                      to="/contracts" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <Layers className="size-3.5" />
                      Contracts
                    </Link>
                    <Link 
                      to="/chat" 
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-350 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <MessageSquare className="size-3.5" />
                      Messages
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
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <Search className="absolute left-3 top-3.5 size-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search freelancers..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-neutral-900 dark:text-white rounded-none"
            />
          </form>

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
                  to="/contracts"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'outline', className: 'w-full py-4 text-sm' })}
                >
                  Contracts
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
                  Join Lancy
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
