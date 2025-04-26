// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  withCredentials: true 
});

const getCSRFToken = () => {
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN=') || row.startsWith('csrftoken='));
  
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  return null;
};

api.interceptors.request.use(config => {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    config.headers['CSRF-Token'] = csrfToken;
  }
  
  return config;
});

export default api;