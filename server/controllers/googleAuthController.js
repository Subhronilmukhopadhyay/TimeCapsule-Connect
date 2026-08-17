import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { pool } from '../config/db.js';
import {
  createOAuthClient,
  getClientUrl,
  isGoogleOAuthConfigured,
  GOOGLE_SCOPES,
} from '../config/googleOAuth.js';
import { resolveGoogleUser } from '../utils/googleAccountLink.js';
import 'dotenv/config';

const STATE_COOKIE = 'g_oauth_state';
const STATE_MAX_AGE = 10 * 60 * 1000; // 10 minutes

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Cookie options for the session token.
 *
 * In production the client and API sit on different hosts, so the cookie has to
 * be SameSite=None; Secure to survive the cross-site OAuth redirect. In local
 * development both run on localhost (cookies ignore the port) and Lax is both
 * sufficient and the only thing browsers accept without HTTPS.
 */
const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'None' : 'Lax',
  maxAge: 3600000,
});

const stateCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'None' : 'Lax',
  maxAge: STATE_MAX_AGE,
});

/** Sends the browser back to the login page with a readable reason. */
const failRedirect = (res, reason) =>
  res.redirect(`${getClientUrl()}/login?error=${encodeURIComponent(reason)}`);

/**
 * Step 1: bounce the user to Google's consent screen.
 * GET /api/auth/google
 */
export const googleAuthStart = (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    console.error('Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
    return failRedirect(res, 'Google sign-in is not configured on this server');
  }

  // A random state value, echoed back by Google, proves the callback belongs to
  // a flow this browser actually started.
  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(STATE_COOKIE, state, stateCookieOptions());

  const oauth2Client = createOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: GOOGLE_SCOPES,
    state,
    // Always let the user pick which Google account to use.
    prompt: 'select_account',
  });

  return res.redirect(url);
};

/**
 * Step 2: Google redirects back with a code. Exchange it, then find, link or
 * create the matching local account.
 * GET /api/auth/google/callback
 */
export const googleAuthCallback = async (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return failRedirect(res, 'Google sign-in is not configured on this server');
  }

  const { code, state, error: googleError } = req.query;

  if (googleError) {
    // User pressed "Cancel" on the consent screen.
    return failRedirect(res, 'Google sign-in was cancelled');
  }

  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { ...stateCookieOptions(), maxAge: undefined });

  if (!code || !state || !expectedState || state !== expectedState) {
    return failRedirect(res, 'Google sign-in failed verification. Please try again');
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    const googleId = profile.id;
    const email = (profile.email || '').toLowerCase().trim();
    const displayName = profile.name || email.split('@')[0];
    const avatarUrl = profile.picture || null;

    if (!googleId || !email) {
      return failRedirect(res, 'Google did not return an email address');
    }

    // Only a Google-verified email may be used to claim an existing account,
    // otherwise anyone able to set an unverified address could take one over.
    if (profile.verified_email === false) {
      return failRedirect(res, 'Please verify your email with Google first');
    }

    const userId = await findLinkOrCreateUser({ googleId, email, displayName, avatarUrl });

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, sessionCookieOptions());

    return res.redirect(`${getClientUrl()}/dashboard`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err?.response?.data || err);
    return failRedirect(res, 'Google sign-in failed. Please try again');
  }
};

/**
 * Runs the link-or-create decision inside a transaction, so two simultaneous
 * callbacks cannot create duplicate rows for the same person.
 */
export const findLinkOrCreateUser = async (profile) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { id, outcome } = await resolveGoogleUser(client, profile);
    await client.query('COMMIT');

    if (outcome === 'merged') {
      console.log(`Linked Google account to existing user ${id} (${profile.email})`);
    }

    return id;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* connection may already be unusable */
    }
    throw err;
  } finally {
    client.release();
  }
};
