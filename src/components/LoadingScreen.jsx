import React from 'react';

export default function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading Namazly"
      aria-live="polite"
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f0ede6 50%, #e8f0ed 100%)' }}
    >
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-4"
          aria-hidden="true"
        >
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid #c1dace', borderTopColor: '#3d8265' }}
          />
        </div>
        <p className="poppins-regular text-sage-600 text-sm tracking-wide">
          Loading Namazly…
        </p>
      </div>
    </div>
  );
}
