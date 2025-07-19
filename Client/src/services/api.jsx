// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  withCredentials: true 
});

const getCSRFToken = () => {
  // First try to get from cookie
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN=') || row.startsWith('csrftoken='));
  
  if (csrfCookie) {
    let token = csrfCookie.split('=')[1];
    // URL decode the token if it's encoded
    return decodeURIComponent(token);
  }
  
  // Fallback to meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  return null;
};

api.interceptors.request.use(config => {
  const csrfToken = getCSRFToken();
  console.log('Using CSRF token:', csrfToken);
  if (csrfToken) {
    // Use multiple header formats for compatibility
    config.headers['X-CSRF-Token'] = csrfToken;
    config.headers['x-csrf-token'] = csrfToken;
    config.headers['_token'] = csrfToken;
  }
  
  return config;
});

export default api;