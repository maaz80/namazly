import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineCalendar, HiOutlineClock, HiOutlineLogout, HiChevronDown, HiOutlineBookOpen } from 'react-icons/hi';

const MoonStar = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-8 h-8"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M36 24c0 6.627-5.373 12-12 12S12 30.627 12 24s5.373-12 12-12c1.06 0 2.09.138 3.07.398C24.39 15.2 23 18.45 23 22c0 5.523 4.477 10 10 10 1.38 0 2.69-.28 3.88-.785C36.614 29.487 36 26.816 36 24z"
      fill="url(#navMoonGrad)"
    />
    <circle cx="38" cy="10" r="1.5" fill="#d4a017" opacity="0.8" />
    <circle cx="34" cy="6" r="1"   fill="#d4a017" opacity="0.9" />
    <defs>
      <linearGradient id="navMoonGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3d8265" />
        <stop offset="1" stopColor="#1f4336" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuRef    = useRef(null);
  const triggerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileTriggerRef = useRef(null);

  /* Close menus on outside click */
  useEffect(() => {
    const handle = (e) => {
      // Close user account menu
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      // Close mobile navigation menu
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
          mobileTriggerRef.current && !mobileTriggerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen, mobileMenuOpen]);

  /* Close menus on Escape */
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav
      className="sticky top-0 z-50 glass-card border-b border-white/60"
      style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 no-underline shrink-0"
          aria-label="Namazly — Go to home page"
        >
          <MoonStar />
          <span className="poppins-regular text-lg sm:text-xl font-bold gradient-text tracking-tight">
            Namazly
          </span>
        </a>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/calendar"
            className="poppins-regular text-sm font-semibold text-sage-600 hover:text-sage-900 transition-colors flex items-center gap-1.5"
            title="Islamic Calendar"
          >
            <HiOutlineCalendar className="text-lg text-sage-500" />
            <span>Calendar</span>
          </a>
          <a
            href="/timings"
            className="poppins-regular text-sm font-semibold text-sage-600 hover:text-sage-900 transition-colors flex items-center gap-1.5"
            title="Namaz Timings"
          >
            <HiOutlineClock className="text-lg text-sage-500" />
            <span>Namaz Timings</span>
          </a>
          <a
            href="/guide"
            className="poppins-regular text-sm font-semibold text-sage-600 hover:text-sage-900 transition-colors flex items-center gap-1.5"
            title="User Guide"
          >
            <HiOutlineBookOpen className="text-lg text-sage-500" />
            <span>Guide</span>
          </a>
        </div>

        {/* User Actions & Mobile Hamburger */}
        <div className="flex items-center">
          {/* User menu or Sign In */}
          {user ? (
            <div className="relative">
              <button
                ref={triggerRef}
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-controls="user-dropdown"
                aria-label={`Account menu for ${user.name}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card-deep
                           hover:bg-white/60 transition-all duration-200 cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.name}'s profile picture`}
                    className="w-7 h-7 rounded-full border border-white/80 object-cover"
                    loading="lazy"
                    width={28}
                    height={28}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full bg-sage-500 flex items-center justify-center text-white text-xs font-bold"
                    aria-hidden="true"
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block poppins-regular text-sm font-medium text-sage-800 max-w-[140px] truncate">
                  {user.name}
                </span>
                <HiChevronDown className={`w-4 h-4 text-sage-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  id="user-dropdown"
                  ref={menuRef}
                  role="menu"
                  aria-label="Account options"
                  className="absolute right-0 top-12 w-52 glass-card rounded-2xl shadow-xl
                             border border-white/80 overflow-hidden animate-scale-in"
                >
                  <div className="px-4 py-3 border-b border-sage-100/60" role="none">
                    <p className="poppins-regular text-xs text-sage-400">Signed in as</p>
                    <p className="poppins-regular text-sm font-medium text-sage-800 truncate">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 poppins-regular text-sm text-rose-500
                               hover:bg-rose-50/60 transition-colors duration-150 flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              aria-label="Sign in with Google to sync your prayer records"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                         poppins-regular text-sm font-semibold text-white
                         bg-gradient-to-r from-sage-600 to-sage-500
                         hover:from-sage-700 hover:to-sage-600
                         shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-0"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Hamburger Menu Toggle (Mobile Only) */}
          <button
            ref={mobileTriggerRef}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl glass-card-deep border border-white/60 hover:bg-white/60 transition-all text-sage-700 cursor-pointer ml-2 bg-transparent"
          >
            {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden glass-card border-t border-white/40 overflow-hidden animate-scale-in origin-top flex flex-col p-4 space-y-3 shadow-lg absolute left-0 right-0"
        >
          <a
            href="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card-deep hover:bg-white/60 text-sage-800 poppins-regular text-sm font-semibold transition-all"
          >
            <HiOutlineCalendar className="text-xl text-sage-500" />
            <span>Islamic Calendar</span>
          </a>
          <a
            href="/timings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card-deep hover:bg-white/60 text-sage-800 poppins-regular text-sm font-semibold transition-all"
          >
            <HiOutlineClock className="text-xl text-sage-500" />
            <span>Namaz Timings</span>
          </a>
          <a
            href="/guide"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card-deep hover:bg-white/60 text-sage-800 poppins-regular text-sm font-semibold transition-all"
          >
            <HiOutlineBookOpen className="text-xl text-sage-500" />
            <span>Usage Guide</span>
          </a>
        </div>
      )}
    </nav>
  );
}
