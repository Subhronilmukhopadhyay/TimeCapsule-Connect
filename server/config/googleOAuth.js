import { google } from 'googleapis';
import 'dotenv/config';

/**
 * Google OAuth 2.0 configuration.
 *
 * The redirect URI must match one of the "Authorized redirect URIs" registered
 * against the OAuth client in the Google Cloud console, character for
 * character, or Google rejects the request with redirect_uri_mismatch.
 */
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const isGoogleOAuthConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/** Where the browser lands once sign-in finishes. */
export const getClientUrl = () =>
  process.env.CLIENT_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://timecapsule-connect-1.onrender.com'
    : 'http://localhost:5173');

const getRedirectUri = () =>
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.SERVER_URL || 'http://localhost:8000'}/api/auth/google/callback`;

/**
 * A fresh client per request. The googleapis OAuth2 client stores tokens on the
 * instance, so sharing one across concurrent sign-ins would leak credentials
 * between users.
 */
export const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
