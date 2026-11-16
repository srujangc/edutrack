import express from 'express';
import {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTimetable)
  .post(createTimetableEntry);

router.route('/:id')
  .put(updateTimetableEntry)
  .delete(deleteTimetableEntry);

export default router;
