// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  withCredentials: true 
});

const getCSRFToken = () => {
  // Add a try-catch block to handle potential errors when accessing document.cookie
  try {
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN=') || row.startsWith('csrftoken='));
    console.log("HERE CSRF at API:", csrfCookie);
    if (csrfCookie) {
      return csrfCookie.split('=')[1];
    }

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    return null;
  } catch (error) {
    console.error('Error getting CSRF token from cookies or meta tag:', error);
    return null;
  }
};

api.interceptors.request.use(config => {
  // Add a try-catch block for the request interceptor
  try {
    const csrfToken = getCSRFToken();
    console.log('Using CSRF token:', csrfToken);

    // Only add the header if a valid token is found
    if (csrfToken) {
      config.headers['CSRF-Token'] = csrfToken;
      // config.headers['x-csrf-token'] = csrfToken;
    }
    
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    // You can choose to return the original config or a modified one to prevent the request
    return Promise.reject(error);
  }
});

export default api;
