import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

function AuthModalContent({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        await login(null, tokenResponse.access_token);
        onClose();
      } catch (err) {
        setError('Sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed');
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(31,67,54,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sage-400 hover:text-sage-700 transition-colors p-2 text-xl font-bold leading-none cursor-pointer"
          title="Close"
        >
          &times;
        </button>

        {/* Branding Icon */}
        <div className="text-4xl text-center mb-4">🌙</div>

        <h3 className="poppins-regular text-2xl font-bold text-sage-900 text-center mb-2">
          Save Your Progress
        </h3>
        <p className="poppins-regular text-sage-500 text-sm text-center mb-6 leading-relaxed">
          Sign in with Google to sync your tracker, protect your progress, and manage your missed prayers across all your devices.
        </p>

        {/* Google login container */}
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex items-center gap-3 px-8 py-3.5 rounded-2xl glass-card border border-white/80 text-sage-700 poppins-regular font-medium">
              <div className="w-5 h-5 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
              Signing you in…
            </div>
          ) : (
            <button
              onClick={() => googleLogin()}
              aria-label="Sign in with Google"
              className="w-[280px] mx-auto flex items-center justify-center gap-2.5 py-3 rounded-xl
                         poppins-regular text-sm font-semibold text-sage-700 bg-white/60 border border-white/80
                         hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          {error && (
            <p className="mt-4 text-sm text-rose-500 poppins-regular text-center animate-fade-in">
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-sage-400 poppins-regular leading-relaxed">
          By signing in, you agree to our privacy-first approach.
          <br />Your data remains yours.
        </p>
      </div>
    </div>
  );
}

export default function AuthModal(props) {
  if (!props.isOpen) return null;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthModalContent {...props} />
    </GoogleOAuthProvider>
  );
}
