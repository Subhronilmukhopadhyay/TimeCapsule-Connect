import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authenticate from '../controllers/authController.js';
import { pool } from '../config/db.js';

const securityMiddleware = (app) => {
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(helmet());

  app.use(cors({
    origin: isProduction ? 'https://timecapsule-connect-1.onrender.com' : 'http://localhost:5173',
    credentials: true
  }));

  // Must come before csrf
  app.use(cookieParser());

  // 1. Correctly configure the CSRF middleware's SECRET cookie for production
  const csrfProtection = csrf({
    cookie: {
      httpOnly: true, // The secret cookie should NOT be readable by JS
      secure: isProduction, // Must be true in production (requires HTTPS)
      sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-site, 'Lax' for same-site dev
    }
  });

  app.use(csrfProtection);

  app.use(express.json({ limit: '400mb' }));
  app.use(express.urlencoded({ limit: '400mb', extended: true }));

  // This endpoint creates the READABLE token for your client-side script
  app.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();
    res.status(200).json({ csrfToken }); 
  });


  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use(limiter);

  /**
   * Returns the signed-in user's profile.
   *
   * This reads from the database rather than echoing the JWT back, because the
   * client hydrates its auth state from here. Google sign-in arrives via a
   * server-side redirect, so no JS runs to populate the store the way the
   * password login does — without a name and username in this response the
   * dashboard falls back to showing 'Guest'.
   */
  app.get('/me', authenticate, async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT id, name, username, email, avatar_url FROM userlogin WHERE id = $1',
        [req.user.id]
      );

      if (rows.length === 0) {
        // The token is valid but the account no longer exists.
        return res.status(401).json({ error: 'Account no longer exists' });
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error loading current user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export default securityMiddleware;