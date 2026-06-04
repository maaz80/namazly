import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

/* Decorative background */
const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 80% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle at 20% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : '/api';

      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      localStorage.setItem('namazly_admin_token', data.token);
      navigate('/1adminMs1/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a372d 0%, #255342 30%, #1f4336 60%, #0f2219 100%)' }}>
      <Background />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Admin badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold poppins-regular mb-4">
            <HiOutlineLockClosed className="w-3.5 h-3.5" />
            ADMIN ACCESS
          </div>
          <h1 className="poppins-regular text-3xl font-bold text-white">
            Namazly <span className="text-emerald-400">Admin</span>
          </h1>
          <p className="poppins-regular text-sm text-white/50 mt-1">Sign in to access the control panel</p>
        </div>

        {/* Login form card */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="block poppins-regular text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiOutlineMail className="w-5 h-5 text-white/30" />
              </div>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="block w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30
                           bg-white/10 border border-white/15 focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30
                           outline-none transition-all duration-200 poppins-regular"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block poppins-regular text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="w-5 h-5 text-white/30" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="block w-full pl-11 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/30
                           bg-white/10 border border-white/15 focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30
                           outline-none transition-all duration-200 poppins-regular"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center bg-transparent border-0 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword
                  ? <HiOutlineEyeOff className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" />
                  : <HiOutlineEye className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-rose-400 poppins-regular bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 animate-fade-in">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold poppins-regular transition-all duration-200
                       bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
                       text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
                       active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full animate-spin border-2 border-white/30 border-t-white" />
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs poppins-regular mt-6">
          Restricted area · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
