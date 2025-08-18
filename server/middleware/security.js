import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authenticate from '../controllers/authController.js';
import bodyParser from 'body-parser';

const securityMiddleware = (app) => {
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(helmet());

  app.use(cors({
    origin: isProduction ? 'https://timecapsule-connect-1.onrender.com' : 'http://localhost:5173',
    credentials: true
  }));

  // Must come before csrf
  // Add a try-catch block for the cookieParser middleware
  try {
    console.log(isProduction);
    app.use(cookieParser());
  } catch (error) {
    console.error('Error applying cookieParser middleware:', error);
    // You might want to handle this error more gracefully, e.g., by exiting the process
  }

  // 1. Correctly configure the CSRF middleware's SECRET cookie for production
  const csrfProtection = csrf({
    cookie: {
      httpOnly: true, // The secret cookie should NOT be readable by JS
      secure: isProduction, // Must be true in production (requires HTTPS)
      sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-site, 'Lax' for same-site dev
    }
  });

  // Add a try-catch block for the csrfProtection middleware
  try {
    app.use(csrfProtection);
  } catch (error) {
    console.error('Error applying CSRF protection middleware:', error);
    // Again, handle the error as appropriate for your application
  }

  app.use(express.json({ limit: '400mb' }));
  app.use(express.urlencoded({ limit: '400mb', extended: true }));

  // This endpoint creates the READABLE token for your client-side script
  app.get('/csrf-token', (req, res) => {
    try {
      const csrfToken = req.csrfToken();

      // 2. Correctly configure the READABLE token cookie
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // This MUST be false so document.cookie can read it
        secure: isProduction, // Must match the secret cookie's setting
        sameSite: isProduction ? 'None' : 'Lax', // Must match the secret cookie's setting
        maxAge: 3600000, // 1 hour
      });

      res.status(200).json({ csrfToken: csrfToken }); // Also send it in the body as a fallback
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      res.status(500).json({ error: 'Failed to generate CSRF token.' });
    }
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });

  // Add a try-catch block for the rate limiter
  try {
    app.use(limiter);
  } catch (error) {
    console.error('Error applying rate limiting middleware:', error);
  }


  // Add a try-catch block to the authenticate and the response
  app.get('/me', authenticate, (req, res) => {
    try {
      // Check if user object exists to prevent potential errors
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }
      res.status(200).json({ id: req.user.id, email: req.user.email });
    } catch (error) {
      console.error('Error in /me endpoint:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
};

export default securityMiddleware;