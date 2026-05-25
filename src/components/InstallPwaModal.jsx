import React, { useState, useEffect } from 'react';

export default function InstallPwaModal() {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Detect if the application is ALREADY running in standalone mode (already installed & open as app)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;

    if (isStandalone) {
      return; // Already installed as PWA and open, no need to ever show modal
    }

    // 2. Detect if the user is on an iOS device (Safari doesn't support beforeinstallprompt)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // 3. Helper to check if 24 hours have passed since last dismissal
    const shouldPrompt = () => {
      const lastDismissed = localStorage.getItem('namazly_last_install_prompt_dismissed');
      if (!lastDismissed) return true;
      const hoursPassed = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      return hoursPassed >= 24;
    };

    // 4. If iOS user, Safari won't fire beforeinstallprompt. We will manually prompt them once a day
    if (isIosDevice && shouldPrompt()) {
      // Small delay on mount to ensure smooth aesthetic entrance
      const timer = setTimeout(() => setShowModal(true), 3500);
      return () => clearTimeout(timer);
    }

    // 5. Setup beforeinstallprompt listener for standard browsers (Chrome, Edge, Android, etc.)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent standard browser mini-bar from appearing
      setDeferredPrompt(e); // Store event trigger for later

      if (shouldPrompt()) {
        const timer = setTimeout(() => setShowModal(true), 3500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation to instantly dismiss the modal
    const handleAppInstalled = () => {
      console.log('🎉 Namazly PWA installed successfully!');
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show native browser prompt

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice outcome: ${outcome}`);

    if (outcome === 'accepted') {
      setShowModal(false);
      setDeferredPrompt(null);
    } else {
      // Treat dismissal of standard prompt as a 24h suppression
      handleLaterClick();
    }
  };

  const handleLaterClick = () => {
    localStorage.setItem('namazly_last_install_prompt_dismissed', Date.now().toString());
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(31,67,54,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-scale-in text-center border border-white/60">
        
        {/* Close Button */}
        <button
          onClick={handleLaterClick}
          className="absolute top-4 right-4 text-sage-400 hover:text-sage-700 transition-colors p-2 text-xl font-bold leading-none cursor-pointer border-0 bg-transparent"
          title="Dismiss"
        >
          &times;
        </button>

        {/* Namazly App Icon */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg border border-white/80 animate-float bg-white flex items-center justify-center">
          <img src="/icon-192.png" alt="Namazly Logo" className="w-full h-full object-cover" />
        </div>

        {/* Heading */}
        <h3 className="poppins-regular text-xl font-bold text-sage-900 mb-2">
          Install Namazly App
        </h3>
        
        {/* Explanation */}
        <p className="poppins-regular text-sage-500 text-xs sm:text-sm mb-5 leading-relaxed">
          Add Namazly to your home screen for instant access, fullscreen distraction-free prayer tracking, and smooth native performance.
        </p>

        {/* iOS Specific Safari Instructions */}
        {isIos ? (
          <div className="rounded-2xl border border-sage-200/60 bg-white/70 px-4 py-3.5 mb-5 text-left text-sage-700">
            <p className="poppins-regular text-xs font-semibold text-sage-900 mb-1.5 flex items-center gap-1.5">
              <span>📱</span> iOS Installation Guide:
            </p>
            <ol className="poppins-regular text-[11px] space-y-1.5 list-decimal pl-4 leading-normal">
              <li>Open Safari's share menu by tapping the **Share** button <span className="font-bold text-sage-600">📤</span> at the bottom.</li>
              <li>Scroll down the menu list and tap <span className="font-semibold text-sage-800">Add to Home Screen</span>.</li>
              <li>Tap <span className="font-bold text-sage-600">Add</span> in the top right to complete.</li>
            </ol>
          </div>
        ) : null}

        {/* Interactive Buttons */}
        {isIos ? (
          <button
            onClick={handleLaterClick}
            className="w-full py-3 rounded-xl poppins-regular font-semibold text-white text-xs sm:text-sm
                       bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600
                       shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-0"
          >
            Got It!
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleLaterClick}
              className="flex-1 py-3 rounded-xl poppins-regular font-medium text-sage-600 text-xs sm:text-sm
                         bg-sage-50/60 hover:bg-sage-100/60 border border-sage-200/60
                         transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-3 rounded-xl poppins-regular font-semibold text-white text-xs sm:text-sm
                         bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600
                         shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-0"
            >
              Install Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
