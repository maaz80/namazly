import api from './api';

const generateUUID = () => 
  Math.random().toString(36).substring(2, 15) + 
  Math.random().toString(36).substring(2, 15) + 
  Date.now().toString(36);

// Get or create a permanent visitor ID
export const getVisitorId = () => {
  let visitorId = localStorage.getItem('namazly_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + generateUUID();
    localStorage.setItem('namazly_visitor_id', visitorId);
  }
  return visitorId;
};

// Get or create a session token (wiped when browser/tab is closed)
export const getSessionToken = () => {
  let sessionToken = sessionStorage.getItem('namazly_session_token');
  if (!sessionToken) {
    sessionToken = 's_' + generateUUID();
    sessionStorage.setItem('namazly_session_token', sessionToken);
  }
  return sessionToken;
};

// Track website visit (called once per session, with 1.5s delay to prevent page load lag)
export const trackVisit = (email = null) => {
  const sessionToken = getSessionToken();
  const visitorId = getVisitorId();
  const hasTracked = sessionStorage.getItem('namazly_session_tracked') === 'true';
  const trackedEmail = sessionStorage.getItem('namazly_session_email') || '';

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isPwaInstalled = localStorage.getItem('namazly_pwa_installed') === 'true' || isStandalone;

  // Persist stand-alone detection to local storage
  if (isStandalone && localStorage.getItem('namazly_pwa_installed') !== 'true') {
    localStorage.setItem('namazly_pwa_installed', 'true');
  }

  // Trigger visit if not tracked in this session yet, OR if user logs in during session
  if (!hasTracked || (email && trackedEmail !== email)) {
    setTimeout(async () => {
      try {
        await api.post('/analytics/visit', { 
          sessionToken, 
          visitorId, 
          email,
          isPwaInstall: isPwaInstalled
        });
        sessionStorage.setItem('namazly_session_tracked', 'true');
        if (email) {
          sessionStorage.setItem('namazly_session_email', email);
        }
      } catch (err) {
        console.error('Analytics visit error:', err);
      }
    }, 1500);
  }
};

// Track when a user calculates qaza namaz
export const trackNamazCalculation = async () => {
  const sessionToken = getSessionToken();
  try {
    await api.post('/analytics/calculate', { sessionToken });
  } catch (err) {
    console.error('Analytics calculate error:', err);
  }
};

// Track when PWA is installed
export const trackPwaInstall = async () => {
  const sessionToken = getSessionToken();
  try {
    localStorage.setItem('namazly_pwa_installed', 'true');
    await api.post('/analytics/pwa-install', { sessionToken });
  } catch (err) {
    console.error('Analytics PWA install error:', err);
  }
};
