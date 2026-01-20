import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { authenticateToken } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logSuccess } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(limiter);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/user', authenticateToken, userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

// Only start server if running directly (not imported by Vercel serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URI || '')
    .then(() => {
      logSuccess('MongoDB connected successfully');
      app.listen(PORT, () => {
        logSuccess(`Server is running on port ${PORT}`);
        logSuccess(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((error) => {
      console.error('✗ MongoDB connection error:', error);
      process.exit(1);
    });
}

export default app;

