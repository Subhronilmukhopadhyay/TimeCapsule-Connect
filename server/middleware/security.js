import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

const securityMiddleware = (app) => {
  app.use(helmet());
  
  app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true 
  }));

  const csrfProtection = csrf({ cookie: true });

  app.use(cookieParser());
  app.use(csrfProtection);

  app.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken(); 

    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict',
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
};

export default securityMiddleware;