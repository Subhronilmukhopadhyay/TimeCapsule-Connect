import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authenticate from '../controllers/authController.js';

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

    // 2. Correctly configure the READABLE token cookie
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // This MUST be false so document.cookie can read it
      secure: isProduction, // Must match the secret cookie's setting
      sameSite: isProduction ? 'None' : 'Lax', // Must match the secret cookie's setting
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ csrfToken: csrfToken }); // Also send it in the body as a fallback
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use(limiter);

  app.get('/me', authenticate, (req, res) => {
    res.status(200).json({ id: req.user.id, email: req.user.email });
  });
};

export default securityMiddleware;