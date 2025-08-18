// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  withCredentials: true
});

api.interceptors.request.use(config => {
  const csrfToken = localStorage.getItem('csrf'); // ✅ safe + reliable
  if (csrfToken) {
    config.headers['CSRF-Token'] = csrfToken;
  }
  return config;
});

export default api;
