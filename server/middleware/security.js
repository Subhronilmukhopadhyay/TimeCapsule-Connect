import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authenticate from '../controllers/authController.js';
import bodyParser from 'body-parser';

const securityMiddleware = (app) => {
  app.use(helmet());
  
  app.use(cors({ 
    origin: 'https://timecapsule-connect-1.onrender.com', //production mode
    // origin: 'http://localhost:5173', //development mode
    credentials: true 
  }));

  app.use(cookieParser());

  // FIXED: Configure CSRF properly for production
  const csrfProtection = csrf({
    cookie: {
      key: '_csrf', // Use a consistent key
      httpOnly: false, // IMPORTANT: Must be false for client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 3600000, // 1 hour
    },
    // Add custom value function to handle different header formats
    value: function (req) {
      return (
        req.body && req.body._token ||
        req.query && req.query._token ||
        req.headers['csrf-token'] ||
        req.headers['x-csrf-token'] ||
        req.headers['x-xsrf-token']
      );
    }
  });

  app.use(csrfProtection);

  // Increase body size limits
  app.use(bodyParser.json({ limit: '400mb' }));
  app.use(bodyParser.urlencoded({ limit: '400mb', extended: true }));

  app.use(express.json({ limit: '400mb' }));
  app.use(express.urlencoded({ limit: '400mb', extended: true }));

  // FIXED: Improved CSRF token endpoint
  app.get('/csrf-token', (req, res) => {
    try {
      const csrfToken = req.csrfToken();
      
      // Set the token in cookie with proper encoding
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // MUST be false for client access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 3600000,
        encode: String // Prevent double encoding
      });
      
      // Also return in response body as backup
      res.status(200).json({ 
        message: 'CSRF token set in cookie',
        csrfToken: csrfToken // Include in response as fallback
      });
    } catch (error) {
      console.error('CSRF token generation error:', error);
      res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
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