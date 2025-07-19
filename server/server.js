import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import unlockScheduler from './utils/unlockScheduler.js';
import securityMiddleware from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import CreateCapsuleRoutes from './routes/createCapsuleRoutes.js';
import ViewCapsuleRoutes from './routes/ViewCapsuleRoutes.js';
import mediaHandle from './routes/mediaHandle.js';

const app = express();

// Database Connection
connectDB();

//cron-job for every 30 mins to see if locked capsule can be now unlocked
unlockScheduler();

// Middleware
app.use(express.json());
securityMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/media-handle',mediaHandle);
app.use('/create/capsule', CreateCapsuleRoutes);
app.use('/view/capsule', ViewCapsuleRoutes);

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('❌ Invalid CSRF token');
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
