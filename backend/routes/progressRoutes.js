import express from 'express';
import { getDashboardData, getAcademicProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardData);
router.get('/progress', getAcademicProgress);

export default router;
