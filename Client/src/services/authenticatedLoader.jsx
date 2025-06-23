// service/authenticatedLoader.js
import { redirect } from 'react-router-dom';
import api from './api';

export function authenticatedLoader(loader) {
  return async (args) => {
    try {
      await api.get('/me'); 
      return loader ? loader(args) : null;
    } catch (err) {
      console.error('Auth check failed:', err);
      throw redirect('/login');
    }
  };
}

export function redirectIfAuthenticatedLoader(loader) {
  return async (args) => {
    try {
      await api.get('/me');
      // Already logged in — redirect to dashboard
      throw redirect('/dashboard'); 
    } catch {
      // Not logged in — continue to login/register
      return loader ? loader(args) : null;
    }
  };
}