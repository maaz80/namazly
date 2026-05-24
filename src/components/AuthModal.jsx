import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleCredentialResponse = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      await login(credentialResponse.credential);
      onClose();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Google sign-in failed');
  };

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
            <div className="w-full flex justify-center overflow-hidden">
              <GoogleLogin
                onSuccess={handleCredentialResponse}
                onError={handleError}
                shape="rectangular"
                size="large"
                width="280"
                text="signin_with"
                logo_alignment="left"
              />
            </div>
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
