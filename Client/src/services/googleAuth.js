// services/googleAuth.js

/**
 * Kicks off the Google OAuth flow.
 *
 * This is a full-page navigation rather than an XHR on purpose: the browser has
 * to follow Google's redirects and land back on the API so the session cookie
 * can be set on a top-level request.
 *
 * Note this reads import.meta.env, not process.env — the project builds with
 * Vite, where process is not defined in the browser and the old
 * `process.env.REACT_APP_API_URL` reference threw before the redirect ever ran.
 */
export const startGoogleLogin = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
  // Tolerate VITE_API_URL with or without a trailing slash.
  window.location.href = `${base.replace(/\/+$/, '')}/api/auth/google`;
};

export default startGoogleLogin;
