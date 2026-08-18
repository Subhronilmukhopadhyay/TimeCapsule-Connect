// service/authenticatedLoader.js
import { redirect } from 'react-router-dom';
import api from './api';
import store from '../store/store';
import { login as authLogin } from '../store/slices/authSlice';

/**
 * Pushes the profile returned by /me into the auth store.
 *
 * The password login dispatches this itself, but Google sign-in finishes with a
 * server-side redirect, so no client code runs to populate the store and the
 * dashboard would show 'Guest'. Hydrating here covers both paths, and also
 * restores the name after a hard refresh.
 */
const hydrateAuthState = (user) => {
  if (!user?.id) return;

  const current = store.getState().auth.userData;
  // Avoid a pointless dispatch (and localStorage write) on every navigation.
  if (current?.id === user.id && current?.username === user.username) return;

  store.dispatch(authLogin({ userData: user }));
};

export function authenticatedLoader(loader) {
  return async (args) => {
    try {
      const { data } = await api.get('/me');
      hydrateAuthState(data);
      return loader ? loader(args) : null;
    } catch (err) {
      console.error('Auth check failed:', err);
      throw redirect('/login');
    }
  };
}

export function redirectIfAuthenticatedLoader() {
  return async () => {
    try {
      const { data } = await api.get('/me'); // If authenticated
      hydrateAuthState(data);
      return redirect('/dashboard');
    } catch {
      return null; // Not authenticated, proceed to route
    }
  };
}
