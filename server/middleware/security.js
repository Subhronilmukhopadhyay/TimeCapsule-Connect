import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const securityMiddleware = (app) => {
  app.use(helmet());
  
  app.use(cors({ 
    origin: 'http://localhost:5173',
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