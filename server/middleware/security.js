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

  // const csrfProtection = csrf({
  //   cookie: {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'Strict'
  //   }
  // });

  const csrfProtection = csrf({ cookie: true });

  app.use(cookieParser());
  app.use(csrfProtection);

  // Provide CSRF token to frontend
  app.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken(); // Get CSRF token

    // Set CSRF token in a cookie (optional) - make sure the cookie is accessible to frontend JS
    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Allow JavaScript to access this cookie (to send it in headers)
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        sameSite: 'Strict', // Prevent CSRF in third-party contexts
        maxAge: 3600000, // 1 hour expiration
    });

    // Log and send response with the token
    // console.log('CSRF Token:', csrfToken); // Log it for debugging
    res.status(200).json({ message: 'CSRF token set in cookie' });
    // res.status(200).json({ csrfToken }); // Send token in response body as well
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use(limiter);
};

export default securityMiddleware;