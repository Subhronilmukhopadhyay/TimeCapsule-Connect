// src/service/logout.js
import { useDispatch } from 'react-redux';
import api from './api';
import { logout as authLogout } from '../store/slices/authSlice';

const useLogout = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await api.get('/csrf-token'); // Ensures CSRF cookie is fresh
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err?.response?.data || err.message);
    }
    dispatch(authLogout());
  };

  return logout;
};

export default useLogout;