import express from 'express';
import {
  getExams,
  createExam,
  updateExam,
  toggleExamCompleted,
  deleteExam
} from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExams)
  .post(createExam);

router.route('/:id')
  .put(updateExam)
  .delete(deleteExam);

router.patch('/:id/toggle', toggleExamCompleted);

export default router;
