import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load env from backend folder
dotenv.config();

// Import routes
import authRoutes from '../backend/routes/authRoutes.js';
import platformRoutes from '../backend/routes/platformRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';
import { authenticateToken } from '../backend/middlewares/auth.js';
import { errorHandler } from '../backend/middlewares/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: '*',
    credentials: true
}));

// MongoDB connection (cached for serverless)
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/user', authenticateToken, userRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

// Vercel serverless handler
export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}
