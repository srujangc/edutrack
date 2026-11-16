import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import examRoutes from './routes/examRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import seedRoutes from './routes/seedRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
// CORS — allow localhost in dev, Firebase Hosting URLs in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.web.app or *.firebaseapp.com domain
    if (origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'EduTrack API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', progressRoutes);
app.use('/api/seed', seedRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EduTrack backend server running on port ${PORT}`);
});

export default app;
