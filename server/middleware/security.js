import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import authenticate from '../controllers/authController.js';

const securityMiddleware = (app) => {
  // ✅ Order is important!

  // 1. CORS — early to allow cross-origin cookies
  app.use(cors({
    origin: 'https://timecapsule-connect-1.onrender.com', // production
    // origin: 'http://localhost:5173', // development
    credentials: true
  }));

  // 2. Cookie parser — MUST come before csrf
  app.use(cookieParser());

  // 3. Body parsers — must be before csrf too
  app.use(bodyParser.json({ limit: '400mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '400mb' }));
  app.use(express.json({ limit: '400mb' }));
  app.use(express.urlencoded({ extended: true, limit: '400mb' }));

  // 4. CSRF protection
  const csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    }
  });
  app.use(csrfProtection);

  // 5. Security headers (can come later)
  app.use(helmet());

  // 6. Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use(limiter);

  // 7. CSRF token route for frontend
  app.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();

    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 3600000,
    });

    res.status(200).json({ message: 'CSRF token set in cookie' });
  });

  // 8. Protected route example
  app.get('/me', authenticate, (req, res) => {
    res.status(200).json({ id: req.user.id, email: req.user.email });
  });
};

export default securityMiddleware;