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

  const csrfProtection = csrf({ cookie: true }); // development mode
  // const csrfProtection = csrf({ //production mode
  //   cookie: {
  //     httpOnly: false,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'None',
  //   }
  // });

  app.use(cookieParser());
  app.use(csrfProtection);

  // Increase body size limits
  app.use(bodyParser.json({ limit: '400mb' }));
  app.use(bodyParser.urlencoded({ limit: '400mb', extended: true }));

  // You might also need:
  app.use(express.json({ limit: '400mb' }));
  app.use(express.urlencoded({ limit: '400mb', extended: true }));

  app.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken(); 
    console.log("Meow CSRF: ",csrfToken);
    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None', //production mode
        // sameSite: 'Strict', //development mode
        maxAge: 3600000,
    });
    res.status(200).json({ message: 'CSRF token set in cookie' });
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