import express from 'express';
import {
  getAttendanceOverview,
  getAttendanceLogs,
  recordAttendance,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAttendanceOverview);
router.get('/logs', getAttendanceLogs);
router.post('/', recordAttendance);
router.route('/:id')
  .put(updateAttendance)
  .delete(deleteAttendance);

export default router;
