// services/api.js
import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  withCredentials: true  // Important for cookies/sessions
});

// Get the CSRF token from cookies or meta tag
const getCSRFToken = () => {
  // Try to get from cookie first (many frameworks store it here)
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN=') || row.startsWith('csrftoken='));
  
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }
  
  // If not in cookie, try to get from meta tag (common in many frameworks)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  return null;
};

// Add request interceptor to include CSRF token
api.interceptors.request.use(config => {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    // Set the token in the headers (adjust header name based on your backend)
    config.headers['CSRF-Token'] = csrfToken;    // For Express.js with csurf
  }
  
  return config;
});

export default api;