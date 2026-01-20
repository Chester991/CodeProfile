import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: '*', credentials: true }));

// MongoDB connection (cached for serverless)
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    leetcodeUsername: { type: String, default: '' },
    codeforcesUsername: { type: String, default: '' },
    codechefUsername: { type: String, default: '' },
    refreshToken: { type: String, default: '' }
}, { timestamps: true });

let User;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', userSchema);
}

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Popular users
app.get('/api/platform/popular', (req, res) => {
    res.json({
        success: true,
        data: {
            leetcode: [
                { username: 'tourist', displayName: 'tourist' },
                { username: 'uwi', displayName: 'uwi' },
                { username: 'Petr', displayName: 'Petr' }
            ],
            codeforces: [
                { username: 'tourist', displayName: 'tourist' },
                { username: 'Benq', displayName: 'Benq' },
                { username: 'jiangly', displayName: 'jiangly' }
            ],
            codechef: [
                { username: 'gennady.korotkevich', displayName: 'Gennady' },
                { username: 'errichto', displayName: 'Errichto' },
                { username: 'scott_wu', displayName: 'Scott Wu' }
            ]
        }
    });
});

// LeetCode
app.get('/api/platform/leetcode/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const graphqlQuery = {
            query: `query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount rating globalRanking
        }
      }`,
            variables: { username }
        };

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
        });

        const data = await response.json();
        if (!data.data?.matchedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { matchedUser, userContestRanking } = data.data;
        const stats = matchedUser.submitStats.acSubmissionNum;

        res.json({
            success: true,
            data: {
                username: matchedUser.username,
                problemsSolved: stats.reduce((t, i) => i.difficulty !== 'All' ? t + i.count : t, 0),
                easySolved: stats.find(i => i.difficulty === 'Easy')?.count || 0,
                mediumSolved: stats.find(i => i.difficulty === 'Medium')?.count || 0,
                hardSolved: stats.find(i => i.difficulty === 'Hard')?.count || 0,
                contestRating: userContestRanking?.rating || 0,
                contestsAttended: userContestRanking?.attendedContestsCount || 0
            }
        });
    } catch (error) {
        console.error('LeetCode error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch LeetCode data' });
    }
});

// Codeforces
app.get('/api/platform/codeforces/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const [userInfo, userRating] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.info?handles=${username}`),
            axios.get(`https://codeforces.com/api/user.rating?handle=${username}`)
        ]);

        if (userInfo.data.status !== 'OK') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userInfo.data.result[0];
        const ratings = userRating.data.result || [];

        res.json({
            success: true,
            data: {
                username: user.handle,
                rating: ratings.length ? ratings[ratings.length - 1].newRating : 0,
                maxRating: ratings.length ? Math.max(...ratings.map(r => r.newRating)) : 0,
                contestsAttended: ratings.length,
                rank: user.rank || 'unrated',
                country: user.country || ''
            }
        });
    } catch (error) {
        console.error('Codeforces error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch Codeforces data' });
    }
});

// CodeChef
app.get('/api/platform/codechef/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const response = await fetch(`https://www.codechef.com/users/${username}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124' }
        });

        if (!response.ok) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const rating = doc.querySelector('.rating-number')?.textContent || '0';
        const maxRating = doc.querySelector('.rating-header small')?.textContent?.replace('max', '').trim() || '0';
        const stars = doc.querySelector('.rating-star')?.textContent?.trim() || '';
        const globalRank = doc.querySelector('.rating-ranks a strong')?.textContent?.replace(/,/g, '') || '0';

        res.json({
            success: true,
            data: {
                username,
                rating: parseInt(rating),
                maxRating: parseInt(maxRating),
                stars,
                globalRank: parseInt(globalRank),
                fullySolved: 0
            }
        });
    } catch (error) {
        console.error('CodeChef error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch CodeChef data' });
    }
});

// Auth - Register
app.post('/api/auth/register', async (req, res) => {
    try {
        await connectDB();
        const { username, email, password, leetcodeUsername, codeforcesUsername, codechefUsername } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username, email, password: hashedPassword,
            leetcodeUsername, codeforcesUsername, codechefUsername
        });

        const accessToken = jwt.sign({ userId: user._id, username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            accessToken,
            user: { id: user._id, username, email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Auth - Logout
app.post('/api/auth/logout', async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        await connectDB();
        const user = await User.findById(req.user.userId).select('-password -refreshToken');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        await connectDB();
        const { leetcodeUsername, codeforcesUsername, codechefUsername } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { leetcodeUsername, codeforcesUsername, codechefUsername },
            { new: true }
        ).select('-password -refreshToken');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Vercel handler
export default async function handler(req, res) {
    try {
        return app(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}
