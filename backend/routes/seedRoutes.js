import express from 'express';
import { seedSampleData, resetStudentData } from '../controllers/seedController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', seedSampleData);
router.delete('/reset', resetStudentData);

export default router;
