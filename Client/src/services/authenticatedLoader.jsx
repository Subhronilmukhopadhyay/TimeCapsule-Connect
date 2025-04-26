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
