import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import securityMiddleware from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import CreateCapsuleRoutes from './routes/createCapsuleRoutes.js';
import ViewCapsuleRoutes from './routes/ViewCapsuleRoutes.js';
import mediaHandle from './routes/mediaHandle.js';

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(express.json());
securityMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/media-handle',mediaHandle);
app.use('/create/capsule', CreateCapsuleRoutes);
app.use('/view/capsule', ViewCapsuleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));