import axios from 'axios';

// In production (Netlify), VITE_API_URL points to your Render server.
// In development, we use '/api' which Vite proxies to localhost:5001.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
