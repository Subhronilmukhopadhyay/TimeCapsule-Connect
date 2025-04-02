import helmet from 'helmet';
import cors from 'cors';
import sanitizeMiddleware from "express-sanitize-middleware";
import rateLimit from 'express-rate-limit';

const securityMiddleware = (app) => {
  app.use(helmet());
  
  // Fix: express-sanitize-middleware is typically used directly, not with .sanitize()
  const securityMiddleware = (app) => {
    app.use(sanitizeMiddleware.default()); // ✅ Use .default() for ES modules
  };
  
  app.use(cors({ 
    origin: 'http://localhost:5173', // Remove trailing slash
    credentials: true 
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use(limiter);
};

export default securityMiddleware;