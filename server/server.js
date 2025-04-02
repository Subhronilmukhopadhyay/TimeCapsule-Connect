import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import securityMiddleware from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(express.json());
securityMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));