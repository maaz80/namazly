import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const menuRef    = useRef(null);
  const triggerRef = useRef(null);

  /* Close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
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
          className="flex items-center gap-2.5 no-underline"
          aria-label="Namazly — Go to home page"
        >
          <MoonStar />
          <span className="poppins-regular text-xl font-bold gradient-text tracking-tight">
            Namazly
          </span>
        </a>

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
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-card-deep
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
              <svg
                className={`w-4 h-4 text-sage-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
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
                             hover:bg-rose-50/60 transition-colors duration-150 flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
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
                       shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
